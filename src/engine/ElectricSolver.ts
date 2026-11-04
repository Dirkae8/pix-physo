import { ELEC_COND_LUT, MAT, MATERIAL_BY_ID, STATE_LUT } from '../materials/registry';
import { World } from './World';

export class ElectricSolver {
  private frontierA: Int32Array;
  private frontierB: Int32Array;
  private inFrontier: Uint8Array;
  private activeCells: Int32Array;
  private inActive: Uint8Array;

  constructor(size: number) {
    this.frontierA = new Int32Array(size);
    this.frontierB = new Int32Array(size);
    this.inFrontier = new Uint8Array(size);
    this.activeCells = new Int32Array(size);
    this.inActive = new Uint8Array(size);
  }

  public ensureSize(size: number): void {
    if (this.frontierA.length !== size) {
      this.frontierA = new Int32Array(size);
      this.frontierB = new Int32Array(size);
      this.inFrontier = new Uint8Array(size);
      this.activeCells = new Int32Array(size);
      this.inActive = new Uint8Array(size);
    }
  }

  private effectiveConductivity(matId: number, metaVal: number): number {
    if (matId === MAT.SWITCH || matId === MAT.BUTTON) {
      return metaVal > 0 ? 0.96 : 0;
    }
    return ELEC_COND_LUT[matId];
  }

  private canCouple(mA: number, mB: number): boolean {
    if (mA === MAT.INSULATED_WIRE && (mB === MAT.WATER || mB === MAT.SALTWATER || mB === MAT.ACID || mB === MAT.STEEL)) {
      return false;
    }
    if (mB === MAT.INSULATED_WIRE && (mA === MAT.WATER || mA === MAT.SALTWATER || mA === MAT.ACID || mA === MAT.STEEL)) {
      return false;
    }
    return true;
  }

  public step(world: World, relaxPasses = 6): void {
    this.ensureSize(world.size);

    const w = world.width;
    const h = world.height;
    const mat = world.mat;
    const volt = world.volt;
    const cur = world.current;
    const meta = world.meta;
    const temp = world.temp;

    let frontLen = 0;
    let activeLen = 0;
    this.inFrontier.fill(0);
    this.inActive.fill(0);

    // 1. Decay residual voltages & seed active voltage sources onto wavefront frontier!
    for (let i = 0; i < world.size; i++) {
      const m = mat[i];
      if (m === MAT.EMPTY) {
        volt[i] = 0;
        cur[i] = 0;
        continue;
      }

      if (m === MAT.BUTTON) {
        if (i >= w) {
          const above = mat[i - w];
          if (STATE_LUT[above] === 2 || STATE_LUT[above] === 3) {
            meta[i] = Math.max(meta[i], 12);
          }
        }
        if (meta[i] > 0 && (world.stepTick & 1) === 0) {
          meta[i]--;
        }
        volt[i] = meta[i] > 0 ? 24 : 0;
      } else if (m === MAT.GENERATOR) {
        const x = i % w;
        const y = (i / w) | 0;
        const ai = world.airIdxFromCell(x, y);
        const airFlow = Math.abs(world.airVx[ai]) + Math.abs(world.airVy[ai]);
        volt[i] = 48 + Math.min(16, airFlow * 0.5);
        cur[i] = 18;
      } else if (m === MAT.BATTERY) {
        if (temp[i] > 165) {
          const x = i % w;
          const y = (i / w) | 0;
          mat[i] = MAT.FIRE;
          world.addImpulseExplosion(x, y, 16, 1.15, 1650);
          continue;
        }
        volt[i] = meta[i] > 0 ? Math.max(volt[i] * 0.4, 24 * (0.4 + 0.6 * (meta[i] / 250))) : volt[i] * 0.6;
      } else if (m === MAT.PLASMA || m === MAT.ELECTRIC_ARC) {
        volt[i] = 56;
        cur[i] = 28;
      } else {
        const c = this.effectiveConductivity(m, meta[i]);
        if (c <= 0) {
          volt[i] = 0;
          cur[i] *= 0.4;
          continue;
        }
        // Natural RC discharge between frames so opening a switch immediately cuts power!
        volt[i] *= 0.55;
      }

      if (volt[i] > 0.35 && this.effectiveConductivity(m, meta[i]) > 0) {
        this.frontierA[frontLen++] = i;
        this.inFrontier[i] = 1;
        this.activeCells[activeLen++] = i;
        this.inActive[i] = 1;
      } else {
        cur[i] *= 0.6;
      }
    }

    if (frontLen === 0) return;

    // 2. Fast Wavefront Voltage Propagation from active sources across connected circuits (up to 160 hops!)
    const maxHops = relaxPasses * 22;
    let curFront = this.frontierA;
    let nxtFront = this.frontierB;

    for (let hop = 0; hop < maxHops && frontLen > 0; hop++) {
      let nextLen = 0;

      for (let f = 0; f < frontLen; f++) {
        const i = curFront[f];
        this.inFrontier[i] = 0;
        const m = mat[i];
        const vSrc = volt[i];
        if (vSrc < 0.6) continue;

        const cSrc = this.effectiveConductivity(m, meta[i]);
        const x = i % w;
        const y = (i / w) | 0;

        for (let dy = -1; dy <= 1; dy++) {
          const ny = y + dy;
          if (ny < 0 || ny >= h) continue;
          const nrow = ny * w;
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            if (nx < 0 || nx >= w) continue;
            const j = nrow + nx;
            const mj = mat[j];
            if (mj === 0) continue;

            const cj = this.effectiveConductivity(mj, meta[j]);
            if (cj <= 0 || !this.canCouple(m, mj)) continue;

            const loss = 0.994 - (1 - (cSrc < cj ? cSrc : cj)) * 0.08 - (dx !== 0 && dy !== 0 ? 0.004 : 0);
            const candV = vSrc * loss;

            if (candV > volt[j] + 0.18) {
              volt[j] = candV;
              if (!this.inFrontier[j]) {
                this.inFrontier[j] = 1;
                nxtFront[nextLen++] = j;
              }
              if (!this.inActive[j]) {
                this.inActive[j] = 1;
                this.activeCells[activeLen++] = j;
              }
            }
          }
        }
      }

      const tmp = curFront;
      curFront = nxtFront;
      nxtFront = tmp;
      frontLen = nextLen;
    }

    // 3. Apply physical effects ONLY on energized cells (`activeCells`)!
    for (let k = 0; k < activeLen; k++) {
      const i = this.activeCells[k];
      const m = mat[i];
      const v = volt[i];
      if (v < 0.5) continue;

      const x = i % w;
      const y = (i / w) | 0;
      const cond = this.effectiveConductivity(m, meta[i]);
      cur[i] = v * cond;
      const def = MATERIAL_BY_ID[m];

      if (def.elecResistanceHeat && temp[i] < 1220) {
        temp[i] += v * v * def.elecResistanceHeat * 0.011;
      }

      if (m === MAT.BATTERY) {
        if (v > 27 && meta[i] < 250 && world.rand() < 0.08) {
          meta[i]++;
        } else if (v <= 25 && meta[i] > 0 && world.rand() < 0.0025) {
          meta[i]--;
        }
      } else if (m === MAT.LAMP && v > 4) {
        cur[i] = Math.min(60, v * 1.4);
        if (temp[i] < 75) temp[i] += 0.08;
      } else if (m === MAT.DETONATOR && v > 5) {
        mat[i] = MAT.FIRE;
        world.addImpulseExplosion(x, y, 15, 1.15, 2200);
      } else if (m === MAT.C4 && v > 12) {
        mat[i] = MAT.PLASMA;
        world.addImpulseExplosion(x, y, 30, 2.35, 3600);
      } else if ((m === MAT.SALTWATER || m === MAT.WATER) && v > 16 && world.rand() < 0.008) {
        if (y > 0 && mat[i - w] === MAT.EMPTY) {
          mat[i - w] = world.rand() < 0.66 ? MAT.HYDROGEN : MAT.OXYGEN;
          world.wetness[i - w] = 190;
        }
      } else if (m === MAT.TESLA_COIL && v > 8 && world.rand() < 0.085) {
        this.emitTeslaArc(world, x, y);
      }
    }
  }

  private emitTeslaArc(world: World, sx: number, sy: number): void {
    let bestX = sx + Math.round((world.rand() - 0.5) * 44);
    let bestY = sy - Math.round(8 + world.rand() * 28);
    let bestDist = 999;

    for (let sample = 0; sample < 20; sample++) {
      const tx = sx + Math.round((world.rand() - 0.5) * 68);
      const ty = sy + Math.round((world.rand() - 0.5) * 68);
      if (!world.inBounds(tx, ty)) continue;
      const d = Math.hypot(tx - sx, ty - sy);
      if (d < 5 || d > 38) continue;
      const tm = world.mat[ty * world.width + tx];
      if (tm !== MAT.TESLA_COIL && tm !== MAT.ELECTRIC_ARC && ELEC_COND_LUT[tm] > 0.05 && d < bestDist) {
        bestDist = d;
        bestX = tx;
        bestY = ty;
      }
    }

    const steps = Math.max(6, Math.min(38, Math.round(Math.hypot(bestX - sx, bestY - sy))));
    world.events.electricArcCount++;

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const cx = Math.round(sx + (bestX - sx) * t + (world.rand() - 0.5) * 3.2);
      const cy = Math.round(sy + (bestY - sy) * t + (world.rand() - 0.5) * 3.2);
      if (!world.inBounds(cx, cy)) break;
      const ci = cy * world.width + cx;
      const cm = world.mat[ci];
      if (cm === MAT.EMPTY || STATE_LUT[cm] === 4) {
        world.mat[ci] = MAT.ELECTRIC_ARC;
        world.temp[ci] = 2800;
        world.wetness[ci] = 45 + (world.randByte() & 31);
        world.volt[ci] = 55;
      } else if (cm !== MAT.TESLA_COIL) {
        world.volt[ci] = 52;
        world.temp[ci] += 85;
        break;
      }
    }
  }
}
