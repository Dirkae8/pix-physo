import { ELEC_COND_LUT, MAT, MATERIAL_BY_ID, STATE_LUT, XMAT } from '../materials/registry';
import { World } from './World';
import { wireConnections } from './Wires';

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
    if (matId === MAT.GROUND) return 0;
    if (matId === MAT.RELAY) return (metaVal & 4) ? 0.96 : 0;
    if (matId === MAT.SWITCH || matId === MAT.BUTTON || matId === MAT.THERMOSTAT || matId === MAT.PRESSURE_SWITCH || matId === MAT.FUSE) {
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

      if (m === MAT.RELAY) {
        const direction = meta[i] & 3, x = i % w, y = (i / w) | 0;
        // Coil contacts are perpendicular to the isolated switched path.
        const horizontal = direction === 0 || direction === 2;
        const a = horizontal ? (y > 0 ? i-w : -1) : (x > 0 ? i-1 : -1);
        const b = horizontal ? (y+1 < h ? i+w : -1) : (x+1 < w ? i+1 : -1);
        const powered = (a >= 0 && volt[a] > 4) || (b >= 0 && volt[b] > 4);
        meta[i] = direction | (powered ? 4 : 0);
      }
      if (m === MAT.THERMOSTAT) meta[i] = temp[i] >= 60 ? 1 : 0;
      if (m === MAT.PRESSURE_SWITCH) meta[i] = world.env.pressureKPa + world.airPressure[world.airIdxFromCell(i % w, (i / w) | 0)] >= 120 ? 1 : 0;
      if (m === MAT.FUSE && temp[i] > 180) meta[i] = 0;
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
      } else if (m === XMAT.PIEZO) {
        // Прямой пьезоэффект: механическое напряжение (гидростатика, удар молотом,
        // ударная волна) порождает напряжение до 24 В.
        const ai = world.airIdxFromCell(i % w, (i / w) | 0);
        const load = world.stress[i] + Math.abs(world.airPressure[ai]) * 0.12;
        volt[i] = Math.min(24, load * 1.35);
        cur[i] = volt[i] > 2 ? 4 : 0;
      } else if (m === XMAT.THERMOCOUPLE) {
        // Эффект Зеебека: напряжение пропорционально градиенту температуры.
        const x = i % w, y = (i / w) | 0;
        const left = x > 0 ? temp[i - 1] : temp[i];
        const right = x + 1 < w ? temp[i + 1] : temp[i];
        const up = y > 0 ? temp[i - w] : temp[i];
        const down = y + 1 < h ? temp[i + w] : temp[i];
        const gradient = Math.abs(right - left) + Math.abs(down - up);
        volt[i] = Math.min(24, gradient * 0.09);
        cur[i] = volt[i] > 2 ? 3 : 0;
      } else {
        const c = this.effectiveConductivity(m, meta[i]);
        if (c <= 0) {
          volt[i] = 0;
          cur[i] *= 0.4;
          continue;
        }
        // Natural RC discharge between frames so opening a switch immediately cuts power!
        volt[i] *= m === MAT.CAPACITOR ? 0.985 : 0.55;
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
    const wires = wireConnections(world);
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
        // Insulated flexible wires transfer voltage between fixed endpoints.
        const connections = wires.get(i);
        if (connections !== undefined) for (const j of connections) {
          const cj = this.effectiveConductivity(mat[j], meta[j]);
          const candV = vSrc * .98;
          if (cj > 0 && candV > volt[j] + .18) {
            volt[j] = candV;
            if (!this.inFrontier[j]) { this.inFrontier[j] = 1; nxtFront[nextLen++] = j; }
            if (!this.inActive[j]) { this.inActive[j] = 1; this.activeCells[activeLen++] = j; }
          }
        }

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
            // Prevent a diagonal short directly around an insulated relay body.
            if (dx !== 0 && dy !== 0 && (mat[y*w+nx] === MAT.RELAY || mat[ny*w+x] === MAT.RELAY)) continue;

            const cj = this.effectiveConductivity(mj, meta[j]);
            if (cj <= 0 || !this.canCouple(m, mj)) continue;
            // Only the two axial sides of a relay participate in the switched path.
            if ((m === MAT.RELAY && (((meta[i]&1) === 0 && (dy !== 0 || dx === 0)) || ((meta[i]&1) !== 0 && (dx !== 0 || dy === 0)))) ||
                (mj === MAT.RELAY && (((meta[j]&1) === 0 && (dy !== 0 || dx === 0)) || ((meta[j]&1) !== 0 && (dx !== 0 || dy === 0))))) continue;
            if (m === MAT.DIODE || mj === MAT.DIODE) {
              const dirA = meta[i] & 3, dirB = meta[j] & 3;
              const forwardA = dirA === 0 ? dx : dirA === 1 ? dy : dirA === 2 ? -dx : -dy;
              const forwardB = dirB === 0 ? dx : dirB === 1 ? dy : dirB === 2 ? -dx : -dy;
              if ((m === MAT.DIODE && forwardA <= 0) || (mj === MAT.DIODE && forwardB <= 0)) continue;
            }

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

      if (m === MAT.FUSE && v > 30 && temp[i] < 200) temp[i] += (v - 30) * .04;
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
