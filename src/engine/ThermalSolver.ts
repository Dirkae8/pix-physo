import {
  MAT,
  MATERIAL_BY_ID,
  SPECIFIC_HEAT_LUT,
  THERMAL_COND_LUT,
} from '../materials/registry';
import { World } from './World';

export class ThermalSolver {
  private nextTemp: Float32Array;
  private ambBoilLut: Float32Array;

  constructor(size: number) {
    this.nextTemp = new Float32Array(size);
    this.ambBoilLut = new Float32Array(80);
  }

  public ensureSize(size: number): void {
    if (this.nextTemp.length !== size) {
      this.nextTemp = new Float32Array(size);
    }
  }

  public static boilingPointAtPressure(boilTemp1AtmC: number, localPressureKPa: number): number {
    const p = Math.max(0.25, localPressureKPa);
    const t0K = Math.max(40, boilTemp1AtmC + 273.15);
    const invT = 1 / t0K - Math.log(p / 101.325) / 4650;
    if (invT <= 0.00015) return 3500;
    return 1 / invT - 273.15;
  }

  public step(world: World): void {
    this.ensureSize(world.size);

    const w = world.width;
    const h = world.height;
    const mat = world.mat;
    const temp = world.temp;
    const out = this.nextTemp;
    const ambT = world.env.ambientTempC;
    const basePKPa = world.env.pressureKPa;
    const humidity = world.env.humidity;

    for (let y = 0; y < h; y++) {
      const row = y * w;
      const hasUp = y > 0;
      const hasDown = y + 1 < h;

      for (let x = 0; x < w; x++) {
        const i = row + x;
        const m = mat[i];
        let t = temp[i];

        if (m === MAT.EMPTY) {
          let sum = 0;
          let count = 0;
          if (x > 0 && mat[i - 1] !== 0) {
            sum += temp[i - 1];
            count++;
          }
          if (x + 1 < w && mat[i + 1] !== 0) {
            sum += temp[i + 1];
            count++;
          }
          if (hasUp && mat[i - w] !== 0) {
            sum += temp[i - w];
            count++;
          }
          if (hasDown && mat[i + w] !== 0) {
            sum += temp[i + w];
            count++;
          }
          if (count > 0) {
            t = t * 0.86 + (sum / count) * 0.11 + ambT * 0.03;
          } else {
            t += (ambT - t) * 0.06;
          }
          out[i] = t;
          continue;
        }

        const kC = THERMAL_COND_LUT[m];
        const cp = SPECIFIC_HEAT_LUT[m] || 1.0;
        let flux = 0;
        let maxDeltaNeighbor = 0;

        if (x > 0) {
          const j = i - 1;
          const kN = THERMAL_COND_LUT[mat[j]];
          const dT = temp[j] - t;
          flux += ((2 * kC * kN) / (kC + kN + 0.0001)) * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }
        if (x + 1 < w) {
          const j = i + 1;
          const kN = THERMAL_COND_LUT[mat[j]];
          const dT = temp[j] - t;
          flux += ((2 * kC * kN) / (kC + kN + 0.0001)) * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }
        if (hasUp) {
          const j = i - w;
          const kN = THERMAL_COND_LUT[mat[j]];
          const dT = temp[j] - t;
          flux += ((2 * kC * kN) / (kC + kN + 0.0001)) * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }
        if (hasDown) {
          const j = i + w;
          const kN = THERMAL_COND_LUT[mat[j]];
          const dT = temp[j] - t;
          flux += ((2 * kC * kN) / (kC + kN + 0.0001)) * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }

        t += (flux * 0.42) / cp;

        if (t > 600) {
          t -= (t - ambT) * 0.0018;
        } else {
          t += (ambT - t) * 0.0008;
        }

        if (m === MAT.URANIUM && t < 85) {
          t += 0.12;
        }

        if (m === MAT.GLASS && t > 260 && maxDeltaNeighbor > 240 && world.rand() < 0.35) {
          mat[i] = MAT.GLASS_SHARDS;
          world.events.fractureCount++;
        }

        out[i] = t < -273.15 ? -273.15 : t > 9500 ? 9500 : t;
      }
    }

    temp.set(out);

    for (let id = 1; id < 80; id++) {
      const d = MATERIAL_BY_ID[id];
      this.ambBoilLut[id] =
        d.boilTempC !== undefined ? ThermalSolver.boilingPointAtPressure(d.boilTempC, basePKPa) : 99999;
    }
    const steamCondenseBase = ThermalSolver.boilingPointAtPressure(100, basePKPa) - 6;

    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = row + x;
        const m = mat[i];
        if (m === MAT.EMPTY) continue;

        const def = MATERIAL_BY_ID[m];
        const t = temp[i];

        // 1. Melting
        if (def.meltTempC !== undefined && def.meltInto !== undefined && t > def.meltTempC) {
          if (world.rand() < Math.min(0.65, 0.08 + (t - def.meltTempC) * 0.015)) {
            mat[i] = def.meltInto;
            temp[i] -= 8;
            continue;
          }
        }

        // 2. Clausius-Clapeyron Pressure-Dependent Boiling!
        if (def.boilTempC !== undefined && def.boilInto !== undefined) {
          const ai = world.airIdxFromCell(x, y);
          const dP = world.airPressure[ai];
          const effBoilC =
            dP > -0.4 && dP < 0.4
              ? this.ambBoilLut[m]
              : ThermalSolver.boilingPointAtPressure(def.boilTempC, Math.max(0.25, basePKPa + dP));

          if (t > effBoilC) {
            const superheat = t - effBoilC;
            if (world.rand() < Math.min(0.8, 0.14 + superheat * 0.03)) {
              if (m === MAT.SALTWATER && world.rand() < 0.28) {
                mat[i] = MAT.SALT;
              } else if (m === MAT.SYRUP && world.rand() < 0.32) {
                mat[i] = t > 210 ? MAT.CHARCOAL : MAT.SUGAR;
              } else {
                mat[i] = def.boilInto;
                world.wetness[i] = 190 + (world.randByte() & 63);
                world.airPressure[ai] += 0.9;
                world.events.sizzleCount++;
              }
              // Cool neighboring liquid slightly while keeping vapor above dew point
              if (y + 1 < h && mat[i + w] === m) {
                temp[i + w] -= 4;
              }
              continue;
            }
          } else if (
            m === MAT.GASOLINE &&
            t > 12 &&
            y > 0 &&
            mat[i - w] === MAT.EMPTY &&
            world.rand() < 0.0045
          ) {
            mat[i - w] = MAT.FUEL_VAPOR;
            temp[i - w] = t;
            world.wetness[i - w] = 180;
          } else if (
            m === MAT.WATER &&
            humidity < 35 &&
            t > 28 &&
            y > 0 &&
            mat[i - w] === MAT.EMPTY &&
            world.rand() < 0.0005 * (1 - humidity / 100)
          ) {
            mat[i] = MAT.STEAM;
            world.wetness[i] = 120;
            continue;
          }
        }

        // 3. Freezing / Condensation (Steam dew-point also shifts with pressure via Clausius-Clapeyron!)
        if (def.freezeTempC !== undefined && def.freezeInto !== undefined) {
          let thresholdC = def.freezeTempC;
          if (m === MAT.STEAM) {
            const ai = world.airIdxFromCell(x, y);
            const dP = world.airPressure[ai];
            thresholdC =
              dP > -0.4 && dP < 0.4
                ? steamCondenseBase
                : ThermalSolver.boilingPointAtPressure(100, Math.max(0.25, basePKPa + dP)) - 6;
          }

          if (t < thresholdC) {
            const undercool = thresholdC - t;
            let prob = Math.min(0.65, 0.04 + undercool * 0.015);
            if (m === MAT.STEAM) {
              prob *= 0.6 + (humidity / 100) * 1.1;
            }
            if (world.rand() < prob) {
              mat[i] = def.freezeInto;
              temp[i] += 4;
              continue;
            }
          }
        }
      }
    }
  }
}
