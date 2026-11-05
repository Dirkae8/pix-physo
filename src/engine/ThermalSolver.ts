import {
  MAT,
  MAX_MAT_ID,
  MATERIAL_BY_ID,
  SPECIFIC_HEAT_LUT,
  THERMAL_COND_LUT,
} from '../materials/registry';
import { World } from './World';

// Symmetric interface conductivity depends only on material IDs, not on the frame.
const INTERFACE_COND = new Float32Array(MAX_MAT_ID * MAX_MAT_ID);
for (let a = 0; a < MAX_MAT_ID; a++) for (let b = 0; b < MAX_MAT_ID; b++) {
  const ka = THERMAL_COND_LUT[a], kb = THERMAL_COND_LUT[b];
  INTERFACE_COND[a * MAX_MAT_ID + b] = 2 * ka * kb / (ka + kb + 0.0001);
}


export class ThermalSolver {
  private nextTemp: Float32Array;
  private ambBoilLut: Float32Array;
  private lastBoilPressure = NaN;
  private steamCondenseBase = 0;

  constructor(size: number) {
    this.nextTemp = new Float32Array(size);
    this.ambBoilLut = new Float32Array(MAX_MAT_ID);
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

        const kOffset = m * MAX_MAT_ID;
        const cp = SPECIFIC_HEAT_LUT[m] || 1.0;
        let flux = 0;
        let conductance = 0;
        let maxDeltaNeighbor = 0;

        if (x > 0) {
          const j = i - 1;
          const kN = INTERFACE_COND[kOffset + mat[j]];
          conductance += kN;
          const dT = temp[j] - t;
          flux += kN * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }
        if (x + 1 < w) {
          const j = i + 1;
          const kN = INTERFACE_COND[kOffset + mat[j]];
          conductance += kN;
          const dT = temp[j] - t;
          flux += kN * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }
        if (hasUp) {
          const j = i - w;
          const kN = INTERFACE_COND[kOffset + mat[j]];
          conductance += kN;
          const dT = temp[j] - t;
          flux += kN * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }
        if (hasDown) {
          const j = i + w;
          const kN = INTERFACE_COND[kOffset + mat[j]];
          conductance += kN;
          const dT = temp[j] - t;
          flux += kN * dT;
          if (-dT > maxDeltaNeighbor) maxDeltaNeighbor = -dT;
        }

        // Bound the explicit Fourier step: no cell can overshoot its neighbours.
        // The previous fixed coefficient became unstable for highly conductive metals.
        t += flux * Math.min(0.42 / cp, 0.24 / (conductance + 0.0001));

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

    // Sparse line-of-sight thermal radiation, with energy transferred between heat capacities.
    // Air/gases are transparent; the first solid or liquid absorbs the ray.
    if ((world.stepTick & 7) === 0) for (let y=0; y<h; y++) for (let x=0; x<w; x++) {
      const i=y*w+x, id=mat[i], t=temp[i];
      if (!id || t < 300 || MATERIAL_BY_ID[id].state === 'gas') continue;
      for (let d=0; d<4; d++) {
        const dx=d===0?1:d===1?-1:0, dy=d===2?1:d===3?-1:0;
        for (let k=1; k<=12; k++) {
          const nx=x+dx*k, ny=y+dy*k; if (nx<0||nx>=w||ny<0||ny>=h) break;
          const j=ny*w+nx, target=mat[j];
          if (!target || MATERIAL_BY_ID[target].state === 'gas') continue;
          const diff=temp[i]-temp[j];
          if (diff>0) {
            const ca=SPECIFIC_HEAT_LUT[id] || 1, cb=SPECIFIC_HEAT_LUT[target] || 1;
            const energy=Math.min(diff*Math.min(ca,cb)*.01, diff*.0006/(1+k*.1));
            temp[i]-=energy/ca; temp[j]+=energy/cb;
          }
          break;
        }
      }
    }

    if (basePKPa !== this.lastBoilPressure) {
      for (let id = 1; id < MAX_MAT_ID; id++) {
        const d = MATERIAL_BY_ID[id];
        this.ambBoilLut[id] =
          d.boilTempC !== undefined ? ThermalSolver.boilingPointAtPressure(d.boilTempC, basePKPa) : 99999;
      }
      this.steamCondenseBase = ThermalSolver.boilingPointAtPressure(100, basePKPa) - 6;
      this.lastBoilPressure = basePKPa;
    }
    const steamCondenseBase = this.steamCondenseBase;

    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = row + x;
        const m = mat[i];
        if (m === MAT.EMPTY) continue;

        const def = MATERIAL_BY_ID[m];
        const t = temp[i];

        if (m === MAT.DRY_ICE && t > -78.5 && world.rand() < Math.min(.025, .001 + (t + 78.5) * .00015)) {
          mat[i] = MAT.CO2; temp[i] = Math.max(-100, t - 8); world.wetness[i] = 190; continue;
        }
        if (m === MAT.WATER_VAPOR) {
          // Approximate dew point from relative humidity (Magnus equation).
          const rh = Math.max(.001, Math.min(1, humidity / 100));
          const ambient = Math.max(-80, Math.min(100, ambT));
          const gamma = Math.log(rh) + 17.625 * ambient / (243.04 + ambient);
          const dew = 243.04 * gamma / (17.625 - gamma);
          let coldSurface = false;
          if (x > 0 && mat[i-1] === MAT.GLASS && temp[i-1] < dew) coldSurface = true;
          if (x+1 < w && mat[i+1] === MAT.GLASS && temp[i+1] < dew) coldSurface = true;
          if (y > 0 && mat[i-w] === MAT.GLASS && temp[i-w] < dew) coldSurface = true;
          if (y+1 < h && mat[i+w] === MAT.GLASS && temp[i+w] < dew) coldSurface = true;
          if (coldSurface && world.rand() < .015) { mat[i] = t < 0 ? MAT.FROST : MAT.WATER; temp[i] += 2; continue; }
        }

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
            // At atmospheric pressure water needs time and latent heat to vaporise.
            // Low-pressure flashing remains faster because the boiling point is much lower.
            const waterAtPressure = (m === MAT.WATER || m === MAT.SALTWATER || m === MAT.SEAWATER) && basePKPa >= 20;
            const boilChance = waterAtPressure ? Math.min(0.12, 0.018 + superheat * 0.003) : Math.min(0.8, 0.14 + superheat * 0.03);
            if (world.rand() < boilChance) {
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
              // Approximate latent heat withdrawn from the liquid below, never below ambient.
              if (y + 1 < h && mat[i + w] === m) {
                temp[i + w] = Math.max(ambT, temp[i + w] - (waterAtPressure ? Math.min(12, 2 + superheat * 0.3) : 4));
              }
              if (waterAtPressure) temp[i] = Math.max(effBoilC, temp[i] - Math.min(12, superheat));
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
            (m === MAT.WATER || m === MAT.SALTWATER || m === MAT.SEAWATER) && t > 0 && y > 0 && mat[i - w] === MAT.EMPTY &&
            world.rand() < Math.min(.002, .00018 * Math.exp(Math.min(3, (t - 20) / 35)) * Math.max(0, 1 - humidity / 100))
          ) {
            if (m !== MAT.WATER && world.rand() < .25) {
              mat[i] = MAT.SALT;
              mat[i-w] = MAT.WATER_VAPOR; temp[i-w] = t; world.wetness[i-w] = 120;
            } else {
              mat[i] = MAT.WATER_VAPOR; world.wetness[i] = 120;
            }
            temp[i] = Math.max(-5, t - 2);
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
