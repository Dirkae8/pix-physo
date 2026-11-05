import { BrushShape, GameSettings } from '../types/physics';
import { ELEC_COND_LUT, MAT, MATERIAL_BY_ID, STATE_LUT } from '../materials/registry';
import { AirSolver } from './AirSolver';
import { ChemistrySolver } from './ChemistrySolver';
import { DeviceSolver } from './DeviceSolver';
import { CurrentSolver } from './CurrentSolver';
import { ElectricSolver } from './ElectricSolver';
import { MechanicsSolver } from './MechanicsSolver';
import { stepMechanicalSystem } from './MechanicalSystem';
import { SurfaceWaveSolver } from './SurfaceWaveSolver';
import { ThermalSolver } from './ThermalSolver';
import { stepWires } from './Wires';
import { World, getResolutionDims } from './World';

export class SimulationEngine {
  public world: World;
  public airSolver: AirSolver;
  public thermalSolver: ThermalSolver;
  public electricSolver: ElectricSolver;
  public chemistrySolver: ChemistrySolver;
  public deviceSolver: DeviceSolver;
  public currentSolver: CurrentSolver;
  public surfaceWaveSolver: SurfaceWaveSolver;
  public mechanicsSolver: MechanicsSolver;

  public paused = false;
  public speedMultiplier = 1;
  private stepAccumulator = 0;

  constructor(settings: GameSettings) {
    const [w, h] = getResolutionDims(settings.resolutionPreset);
    this.world = new World(w, h);
    this.airSolver = new AirSolver(this.world.airSize);
    this.thermalSolver = new ThermalSolver(this.world.size);
    this.electricSolver = new ElectricSolver(this.world.size);
    this.chemistrySolver = new ChemistrySolver();
    this.deviceSolver = new DeviceSolver();
    this.currentSolver = new CurrentSolver();
    this.surfaceWaveSolver = new SurfaceWaveSolver();
    this.mechanicsSolver = new MechanicsSolver(this.world.size);
  }

  public applySettings(settings: GameSettings): boolean {
    const [w, h] = getResolutionDims(settings.resolutionPreset);
    if (w !== this.world.width || h !== this.world.height) {
      this.world.resize(w, h);
      this.airSolver.ensureSize(this.world.airSize);
      this.thermalSolver.ensureSize(this.world.size);
      this.electricSolver.ensureSize(this.world.size);
      this.mechanicsSolver.ensureSize(this.world.size);
      return true;
    }
    return false;
  }

  public stepFrame(settings: GameSettings, forceSingleStep = false): number {
    if (this.paused && !forceSingleStep) {
      return 0;
    }

    const t0 = performance.now();
    this.world.events.explosionEnergy = 0;
    this.world.events.electricArcCount = 0;
    this.world.events.sizzleCount = 0;
    this.world.events.fractureCount = 0;

    // Keep simulation steps intact while spreading expensive accelerated frames.
    // If the hardware cannot keep up, the requested multiplier is a ceiling, not skipped physics.
    this.stepAccumulator = forceSingleStep ? 1 : Math.min(4, this.stepAccumulator + this.speedMultiplier);
    const isBalance = settings.computeMode === 'balance70';
    const mechSubsteps = Math.max(1, settings.substeps);
    let ticks = 0;
    while (this.stepAccumulator >= 1 && ticks < 4) {
      if (ticks > 0 && performance.now() - t0 > 12) break;
      this.stepAccumulator -= 1;
      ticks++;
      this.world.timeSec += 1 / 60;
      this.stepWeather();
      stepWires(this.world);
      this.airSolver.step(this.world, isBalance ? 4 : 2);
      this.surfaceWaveSolver.step(this.world);
      this.thermalSolver.step(this.world);
      if (isBalance) this.thermalSolver.step(this.world);
      this.electricSolver.step(this.world, isBalance ? 8 : 5);
      this.currentSolver.step(this.world);
      this.deviceSolver.step(this.world);
      this.chemistrySolver.step(this.world);
      for (let s = 0; s < mechSubsteps; s++) this.mechanicsSolver.step(this.world, s === 0);
      stepMechanicalSystem(this.world);
    }
    if (forceSingleStep) this.stepAccumulator = 0;

    return performance.now() - t0;
  }

  private stepWeather(): void {
    const w = this.world;
    if (!w.env.precipitation || w.env.boundary === 'closed') return;
    const count = Math.max(1, Math.round(w.width / 110));
    for (let n = 0; n < count; n++) {
      const x = Math.floor(w.rand() * w.width);
      if (w.mat[x] !== MAT.EMPTY) continue;
      const snow = w.env.ambientTempC <= 0;
      w.setCell(x, 0, snow ? MAT.SNOW : MAT.WATER, w.env.ambientTempC);
      w.vy[x] = snow ? 0.4 : 1.5;
    }
    if (w.env.storm && w.rand() < 0.0008) {
      let x = Math.floor(w.rand() * w.width);
      for (let y = 0; y < w.height; y++) {
        if (y > 0 && y % 6 === 0) x = Math.max(0, Math.min(w.width - 1, x + Math.floor(w.rand()*5)-2));
        const i = y*w.width+x;
        if (w.mat[i] !== MAT.EMPTY && STATE_LUT[w.mat[i]] !== 4) {
          w.temp[i] = Math.min(5500, w.temp[i] + 180);
          if (ELEC_COND_LUT[w.mat[i]] > 0) w.volt[i] = Math.max(w.volt[i], 56);
          w.airPressure[w.airIdxFromCell(x,y)] += 4;
          break;
        }
        w.setCell(x, y, MAT.ELECTRIC_ARC);
      }
    }
  }

  public applyBrushStroke(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    matId: number,
    radius: number,
    shape: BrushShape,
    replaceExisting: boolean,
    isErase: boolean
  ): void {
    const world = this.world;
    const dist = Math.hypot(x1 - x0, y1 - y0);
    const steps = Math.max(1, Math.ceil(dist / Math.max(1, radius * 0.45)));

    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0 : s / steps;
      const cx = Math.round(x0 + (x1 - x0) * t);
      const cy = Math.round(y0 + (y1 - y0) * t);
      this.stampBrushAt(cx, cy, x1 - x0, y1 - y0, matId, radius, shape, replaceExisting, isErase);
    }
  }

  private stampBrushAt(
    cx: number,
    cy: number,
    moveDx: number,
    moveDy: number,
    matId: number,
    radius: number,
    shape: BrushShape,
    replaceExisting: boolean,
    isErase: boolean
  ): void {
    const world = this.world;
    const r = Math.max(0, radius);

    if (isErase || matId === MAT.TOOL_ERASER) {
      this.forEachBrushCell(cx, cy, r, shape, (x, y) => {
        const i = y * world.width + x;
        world.mat[i] = MAT.EMPTY;
        world.volt[i] = 0;
        world.current[i] = 0;
        world.wetness[i] = 0;
        world.absorbedMat[i] = 0;
        world.stress[i] = 0;
      });
      return;
    }

    if (matId === MAT.TOOL_EXTINGUISHER) {
      this.forEachBrushCell(cx, cy, r, shape, (x, y, falloff) => {
        const i = y * world.width + x, m = world.mat[i];
        world.temp[i] = Math.max(-40, world.temp[i] - 100 * falloff);
        if (m === MAT.FIRE || m === MAT.EMBER) world.setCell(x, y, MAT.CO2, Math.min(30, world.temp[i]));
      });
      return;
    }

    if (matId === MAT.TOOL_SENSOR) return; // Handled by the UI; does not replace the sampled cell.

    if (matId === MAT.TOOL_LASER || matId === MAT.TOOL_CRYO || matId === MAT.TOOL_IGNITE || matId === MAT.TOOL_SPARK) {
      this.forEachBrushCell(cx, cy, r, shape, (x, y, falloff) => {
        const i = y * world.width + x;
        if (matId === MAT.TOOL_CRYO) world.temp[i] = Math.max(-272, world.temp[i] - 160 * falloff);
        else if (matId === MAT.TOOL_SPARK && world.mat[i] === MAT.EMPTY && world.rand() < 0.12) world.setCell(x, y, MAT.EMBER);
        else if (matId === MAT.TOOL_IGNITE && world.mat[i] === MAT.EMPTY && world.rand() < 0.2) world.setCell(x, y, MAT.FIRE);
        else world.temp[i] = Math.min(5500, world.temp[i] + (matId === MAT.TOOL_LASER ? 450 : 120) * falloff);
      });
      return;
    }
    if (matId === MAT.TOOL_VORTEX || matId === MAT.TOOL_SHOCK || matId === MAT.TOOL_MIXER) {
      this.forEachBrushCell(cx, cy, r + 3, 'circle', (x, y, falloff) => {
        const dx = x - cx, dy = y - cy, len = Math.max(1, Math.hypot(dx, dy));
        const radial = matId === MAT.TOOL_SHOCK;
        const strength = (radial ? 7 : matId === MAT.TOOL_MIXER ? 2 : 4) * falloff;
        const vx = (radial ? dx : -dy) / len * strength, vy = (radial ? dy : dx) / len * strength;
        const ai = world.airIdxFromCell(x, y), i = y * world.width + x;
        world.airVx[ai] += vx * .1; world.airVy[ai] += vy * .1;
        if (radial) world.airPressure[ai] += falloff * .5;
        if (STATE_LUT[world.mat[i]] >= 2 && STATE_LUT[world.mat[i]] <= 5) { world.vx[i] += vx; world.vy[i] += vy; }
      });
      return;
    }

    if (matId === MAT.TOOL_HEAT) {
      this.forEachBrushCell(cx, cy, r + 2, shape, (x, y, falloff) => {
        const i = y * world.width + x;
        world.temp[i] = Math.min(5500, world.temp[i] + 95 * falloff);
      });
      return;
    }

    if (matId === MAT.TOOL_COOL) {
      this.forEachBrushCell(cx, cy, r + 2, shape, (x, y, falloff) => {
        const i = y * world.width + x;
        world.temp[i] = Math.max(-272, world.temp[i] - 85 * falloff);
      });
      return;
    }

    if (matId === MAT.TOOL_WIND) {
      const impulseX = Math.max(-28, Math.min(28, moveDx * 1.8 || 8));
      const impulseY = Math.max(-28, Math.min(28, moveDy * 1.8));
      this.forEachBrushCell(cx, cy, r + 6, 'circle', (x, y, falloff) => {
        const ai = world.airIdxFromCell(x, y);
        world.airVx[ai] += impulseX * 0.45 * falloff;
        world.airVy[ai] += impulseY * 0.45 * falloff;
        world.airPressure[ai] += Math.hypot(impulseX, impulseY) * 0.35 * falloff;
        const i = y * world.width + x;
        if (STATE_LUT[world.mat[i]] >= 2 && STATE_LUT[world.mat[i]] <= 5) {
          world.vx[i] += impulseX * 0.22 * falloff;
          world.vy[i] += impulseY * 0.22 * falloff;
        }
      });
      return;
    }

    if (matId === MAT.TOOL_HAND) {
      return; // Handled via startHandGrab / moveHandGrab
    }

    const def = MATERIAL_BY_ID[matId];
    const isScatter = shape === 'spray' || def.state === 'powder' || def.state === 'gas' || matId === MAT.NEUTRON;

    this.forEachBrushCell(cx, cy, r, shape, (x, y) => {
      if (shape === 'spray' && world.rand() > 0.22) return;
      if (isScatter && shape !== 'square' && r >= 2 && def.state === 'powder' && world.rand() > 0.78) return;

      const i = y * world.width + x;
      const curMat = world.mat[i];
      if (!replaceExisting && curMat !== MAT.EMPTY && STATE_LUT[curMat] !== 4) {
        return;
      }
      world.setCell(x, y, matId);
    });
  }

  public startHandGrab(cx: number, cy: number, radius: number): void {
    const world = this.world;
    world.releaseHand(true);

    const grabR = Math.max(5, radius + 4);
    const r2 = grabR * grabR;
    const indices: number[] = [];

    for (let dy = -grabR; dy <= grabR; dy++) {
      for (let dx = -grabR; dx <= grabR; dx++) {
        if (dx * dx + dy * dy > r2) continue;
        const x = cx + dx;
        const y = cy + dy;
        if (!world.inBounds(x, y)) continue;
        const i = y * world.width + x;
        const m = world.mat[i];
        if (m === MAT.EMPTY) continue;
        const st = STATE_LUT[m];
        if (st === 1 || st === 2 || st === 3) {
          indices.push(i);
        }
      }
    }

    if (indices.length === 0) return;

    world.pushUndo();
    world.hand = {
      active: true,
      anchorX: cx,
      anchorY: cy,
      targetX: cx,
      targetY: cy,
      vx: 0,
      vy: 0,
      detached: false,
      pullForce: 0,
      cluster: [],
      sourceIndices: indices,
    };
  }

  public moveHandGrab(nx: number, ny: number): void {
    const hand = this.world.hand;
    if (!hand.active) return;

    const dx = nx - hand.targetX;
    const dy = ny - hand.targetY;
    hand.vx = hand.vx * 0.45 + Math.max(-14, Math.min(14, dx)) * 0.55;
    hand.vy = hand.vy * 0.45 + Math.max(-14, Math.min(14, dy)) * 0.55;
    hand.targetX = nx;
    hand.targetY = ny;

    // Also stir liquids & air directly along hand movement!
    const ai = this.world.airIdxFromCell(Math.round(nx), Math.round(ny));
    this.world.airVx[ai] += hand.vx * 1.4;
    this.world.airVy[ai] += hand.vy * 1.4;
  }

  private forEachBrushCell(
    cx: number,
    cy: number,
    r: number,
    shape: BrushShape,
    fn: (x: number, y: number, falloff: number) => void
  ): void {
    const w = this.world.width;
    const h = this.world.height;
    const r2 = (r + 0.45) * (r + 0.45);

    for (let dy = -r; dy <= r; dy++) {
      const y = cy + dy;
      if (y < 0 || y >= h) continue;
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        if (x < 0 || x >= w) continue;

        if (shape === 'square') {
          fn(x, y, 1.0);
        } else {
          const d2 = dx * dx + dy * dy;
          if (d2 <= r2) {
            const falloff = r > 0 ? Math.max(0.15, 1 - Math.sqrt(d2) / (r + 1)) : 1.0;
            fn(x, y, falloff);
          }
        }
      }
    }
  }
}
