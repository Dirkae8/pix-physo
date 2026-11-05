import { MAT, MATERIAL_BY_ID, MAX_MAT_ID, POROSITY_LUT } from '../materials/registry';
import { World } from './World';

const IS_ABSORBABLE_LUT = new Uint8Array(MAX_MAT_ID);
IS_ABSORBABLE_LUT[MAT.WATER] = 1;
IS_ABSORBABLE_LUT[MAT.SALTWATER] = 1;
IS_ABSORBABLE_LUT[MAT.MOTOR_OIL] = 1;
IS_ABSORBABLE_LUT[MAT.CRUDE_OIL] = 1;
IS_ABSORBABLE_LUT[MAT.GASOLINE] = 1;
IS_ABSORBABLE_LUT[MAT.ETHANOL] = 1;

const DX4 = [0, -1, 1, 0];
const DY4 = [-1, 0, 0, 1];

const NEEDS_CHEM_LUT = new Uint8Array(MAX_MAT_ID);
for (let id = 1; id < MAX_MAT_ID; id++) {
  const d = MATERIAL_BY_ID[id];
  if (
    d.detonationShockKPa !== undefined ||
    d.flammability > 0 ||
    d.porosity > 0 ||
    d.waterSoluble ||
    id === MAT.FIRE ||
    id === MAT.PLASMA ||
    id === MAT.ELECTRIC_ARC ||
    id === MAT.EMBER ||
    id === MAT.SMOKE ||
    id === MAT.THERMITE ||
    id === MAT.CEMENT ||
    id === MAT.SODIUM ||
    id === MAT.ACID ||
    id === MAT.CHLORINE ||
    id === MAT.NEUTRON
  ) {
    NEEDS_CHEM_LUT[id] = 1;
  }
}

export class ChemistrySolver {
  public step(world: World): void {
    const w = world.width;
    const h = world.height;
    const mat = world.mat;
    const temp = world.temp;
    const wet = world.wetness;
    const absMat = world.absorbedMat;
    const airP = world.airPressure;

    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        const i = row + x;
        const m = mat[i];
        if (!NEEDS_CHEM_LUT[m]) continue;

        const def = MATERIAL_BY_ID[m];
        const t = temp[i];

        // 1. Shockwave sympathetic detonation
        if (def.detonationShockKPa !== undefined) {
          const ai = world.airIdxFromCell(x, y);
          const localOverP = airP[ai];
          const vx = world.vx[i];
          const vy = world.vy[i];
          const velSq = vx * vx + vy * vy;
          if (
            localOverP > def.detonationShockKPa ||
            (m === MAT.NITROGLYCERIN && velSq > 11.56 && y + 1 < h && mat[i + w] !== MAT.EMPTY && mat[i + w] !== MAT.NITROGLYCERIN)
          ) {
            const pwr = def.explosivePower ?? 1.2;
            mat[i] = MAT.PLASMA;
            world.addImpulseExplosion(x, y, Math.round(14 * pwr), pwr, 3200);
            continue;
          }
        }

        // 2. Fire, Plasma, Electric Arc & Ember lifecycle
        if (m === MAT.FIRE || m === MAT.PLASMA || m === MAT.ELECTRIC_ARC) {
          let smothered = false;
          let oxygenBoost = false;
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const nrow = ny * w;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              const nm = mat[nrow + nx];
              if (m === MAT.FIRE && (nm === MAT.CO2 || nm === MAT.WATER || nm === MAT.SALTWATER || nm === MAT.LIQUID_NITROGEN)) {
                smothered = true;
              } else if (nm === MAT.OXYGEN) {
                oxygenBoost = true;
                if (world.rand() < 0.25) mat[nrow + nx] = MAT.FIRE;
              }
            }
          }

          if (smothered) {
            mat[i] = m === MAT.FIRE ? MAT.SMOKE : MAT.STEAM;
            wet[i] = 140;
            continue;
          }
          if (oxygenBoost) {
            temp[i] = Math.min(3600, temp[i] + 140);
          }

          const decay = m === MAT.ELECTRIC_ARC ? 16 : m === MAT.PLASMA ? 8 : 5;
          if (wet[i] <= decay) {
            mat[i] = m === MAT.FIRE && world.rand() < 0.28 ? MAT.SMOKE : MAT.EMPTY;
            wet[i] = mat[i] === MAT.SMOKE ? 150 : 0;
          } else {
            wet[i] -= decay;
          }
          continue;
        }

        if (m === MAT.EMBER) {
          if (t < 550 || world.rand() < 0.025) mat[i] = MAT.EMPTY;
          continue;
        }

        if (m === MAT.SMOKE || m === MAT.STEAM) {
          if (m === MAT.SMOKE) {
            if (wet[i] <= 1) mat[i] = MAT.EMPTY;
            else if (world.rand() < 0.06) wet[i]--;
          }
          continue;
        }

        // 3. Thermite self-oxidizing 2500°C reaction
        if (m === MAT.THERMITE) {
          if (wet[i] === 0 && t >= 680) {
            wet[i] = 90 + (world.randByte() & 63);
          }
          if (wet[i] > 0) {
            temp[i] = Math.max(temp[i], 2550);
            wet[i] -= 3;
            if (y > 0 && mat[i - w] === MAT.EMPTY && world.rand() < 0.25) {
              mat[i - w] = MAT.EMBER;
              temp[i - w] = 2200;
              world.vx[i - w] = (world.rand() - 0.5) * 3.5;
              world.vy[i - w] = -1.5 - world.rand() * 2.5;
            }
            if (wet[i] <= 3) {
              mat[i] = MAT.MOLTEN_METAL;
              temp[i] = 2400;
            }
            continue;
          }
        }

        // 4. General Combustion & Explosive Ignition
        if (def.flammability > 0 && def.ignitionTempC !== undefined) {
          let nearFlame = false;
          let hasOxidizer = m === MAT.GUNPOWDER || m === MAT.NITROGLYCERIN || m === MAT.TNT;
          let nearPureO2 = false;

          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const nrow = ny * w;
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              const nm = mat[nrow + nx];
              if (
                nm === MAT.FIRE ||
                nm === MAT.PLASMA ||
                nm === MAT.ELECTRIC_ARC ||
                nm === MAT.LAVA ||
                nm === MAT.EMBER ||
                nm === MAT.MOLTEN_METAL
              ) {
                nearFlame = true;
                hasOxidizer = true;
              } else if (nm === MAT.EMPTY) {
                hasOxidizer = true;
              } else if (nm === MAT.OXYGEN) {
                hasOxidizer = true;
                nearPureO2 = true;
              }
            }
          }

          if (hasOxidizer && (t >= def.ignitionTempC || (nearFlame && t >= def.ignitionTempC * 0.45))) {
            const prob = def.flammability * (nearPureO2 ? 2.8 : nearFlame ? 1.0 : 0.35);
            if (world.rand() < prob) {
              if (def.state !== 'gas' && def.explosivePower && def.explosivePower >= 0.6) {
                const pwr = def.explosivePower * (nearPureO2 ? 1.45 : 1.0);
                mat[i] = MAT.FIRE;
                world.addImpulseExplosion(x, y, Math.max(6, Math.round(13 * pwr)), pwr, 2400);
                continue;
              }

              const heatAdd = (def.burnHeat ?? 40) * (nearPureO2 ? 2.4 : 1.0);
              temp[i] += heatAdd;

              if (y > 0 && (mat[i - w] === MAT.EMPTY || mat[i - w] === MAT.OXYGEN)) {
                mat[i - w] = MAT.FIRE;
                temp[i - w] = 950 + heatAdd * 4;
                wet[i - w] = 110 + (world.randByte() & 63);
              }

              const burnOutChance =
                m === MAT.COAL || m === MAT.CHARCOAL
                  ? 0.008
                  : m === MAT.WOOD || m === MAT.NAPALM
                  ? 0.022
                  : m === MAT.MOTOR_OIL || m === MAT.CRUDE_OIL
                  ? 0.045
                  : 0.16;

              if (world.rand() < burnOutChance) {
                if (m === MAT.WOOD || m === MAT.SUGAR) {
                  mat[i] = world.rand() < 0.45 ? MAT.CHARCOAL : MAT.FIRE;
                } else {
                  mat[i] = m === MAT.ETHANOL ? MAT.STEAM : MAT.FIRE;
                }
                wet[i] = 120;
                continue;
              }
            }
          }
        }

        // 5. Capillary Absorption & Pore Diffusion (Zero allocations!)
        const por = POROSITY_LUT[m];
        if (por > 0) {
          const maxCap = (por * 250) | 0;
          if (wet[i] < maxCap) {
            for (let d = 0; d < 4; d++) {
              const nx = x + DX4[d];
              const ny = y + DY4[d];
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const j = ny * w + nx;
              const mj = mat[j];

              if (IS_ABSORBABLE_LUT[mj] && (absMat[i] === 0 || absMat[i] === mj)) {
                const absorbStep = m === MAT.SPONGE ? 95 : m === MAT.SAWDUST ? 115 : 135;
                if (wet[i] + absorbStep <= maxCap + 30) {
                  absMat[i] = mj;
                  wet[i] = Math.min(255, wet[i] + absorbStep);
                  mat[j] = MAT.EMPTY;
                  break;
                }
              } else if (POROSITY_LUT[mj] > 0 && wet[j] > wet[i] + 18 && absMat[j] !== 0) {
                if (absMat[i] === 0 || absMat[i] === absMat[j]) {
                  const transfer = Math.min(maxCap - wet[i], (wet[j] - wet[i]) >> 2);
                  if (transfer > 0) {
                    absMat[i] = absMat[j];
                    wet[i] += transfer;
                    wet[j] -= transfer;
                  }
                }
              }
            }
          }

          if (wet[i] > 20 && absMat[i] !== 0) {
            const liqDef = MATERIAL_BY_ID[absMat[i]];
            if ((absMat[i] === MAT.WATER || absMat[i] === MAT.SALTWATER) && t > 105) {
              wet[i] = Math.max(0, wet[i] - 18);
              if (wet[i] === 0) absMat[i] = 0;
              if (y > 0 && mat[i - w] === MAT.EMPTY) {
                mat[i - w] = MAT.STEAM;
                wet[i - w] = 150;
              }
            } else if (liqDef.flammability > 0 && liqDef.ignitionTempC && t > liqDef.ignitionTempC) {
              wet[i] = Math.max(0, wet[i] - 8);
              temp[i] += 18;
              if (y > 0 && mat[i - w] === MAT.EMPTY && world.rand() < 0.35) {
                mat[i - w] = MAT.FIRE;
                wet[i - w] = 110;
              }
              if (wet[i] === 0) absMat[i] = 0;
            }
          }
        }

        // 6. Dissolution: Salt & Sugar in Water
        if (m === MAT.SALT || m === MAT.SUGAR) {
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d];
            const ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx;
            if (mat[j] === MAT.WATER) {
              if (world.rand() < 0.045 + Math.max(0, temp[j]) * 0.0015) {
                mat[j] = m === MAT.SALT ? MAT.SALTWATER : MAT.SYRUP;
                mat[i] = MAT.EMPTY;
                break;
              }
            }
          }
          if (mat[i] === MAT.EMPTY) continue;
        }

        // 7. Cement + Water -> Solid Concrete
        if (m === MAT.CEMENT) {
          let touchingWater = false;
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d];
            const ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx;
            if (mat[j] === MAT.WATER || mat[j] === MAT.SALTWATER) {
              touchingWater = true;
              if (world.rand() < 0.025) mat[j] = MAT.EMPTY;
            }
          }
          if (touchingWater || wet[i] > 0) {
            wet[i] = Math.min(255, wet[i] + (touchingWater ? 6 : 2));
            temp[i] += 0.06;
            if (wet[i] >= 180) {
              mat[i] = MAT.CONCRETE;
              wet[i] = 0;
              continue;
            }
          }
        }

        // 8. Sodium + Water violent alkali metal reaction
        if (m === MAT.SODIUM) {
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d];
            const ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx;
            const mj = mat[j];
            if (mj === MAT.WATER || mj === MAT.SALTWATER || mj === MAT.ACID || mj === MAT.ICE) {
              mat[j] = MAT.HYDROGEN;
              wet[j] = 220;
              temp[i] += 260;
              temp[j] = 420;
              world.vx[i] += (world.rand() - 0.5) * 4;
              world.vy[i] -= 1.8;
              world.events.sizzleCount += 2;
              if (world.rand() < 0.25) {
                mat[i] = MAT.FIRE;
                world.addImpulseExplosion(x, y, 12, 0.85, 1800);
              }
              break;
            }
          }
          if (mat[i] !== MAT.SODIUM) continue;
        }

        // 9. Acid Reactions
        if (m === MAT.ACID) {
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d];
            const ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx;
            const mj = mat[j];
            if (mj === MAT.EMPTY || mj === MAT.ACID) continue;

            if (mj === MAT.SUGAR || mj === MAT.SYRUP) {
              mat[j] = MAT.CHARCOAL;
              temp[j] += 115;
              if (y > 0 && mat[i - w] === MAT.EMPTY) {
                mat[i - w] = world.rand() < 0.65 ? MAT.CHARCOAL : MAT.STEAM;
                temp[i - w] = 140;
              }
              if (world.rand() < 0.35) mat[i] = MAT.STEAM;
              world.events.sizzleCount++;
              break;
            }

            const targetDef = MATERIAL_BY_ID[mj];
            if (targetDef.acidResistance < 0.92 && world.rand() < (1 - targetDef.acidResistance) * 0.095) {
              mat[j] = targetDef.metallic > 0.5 ? MAT.HYDROGEN : MAT.SMOKE;
              wet[j] = 180;
              temp[i] += 28;
              temp[j] += 45;
              world.events.sizzleCount++;
              if (world.rand() < 0.42) mat[i] = MAT.EMPTY;
              break;
            }
          }
          continue;
        }

        // 10. Uranium-235 Nuclear Fission Chain Reaction
        if (m === MAT.NEUTRON) {
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const nrow = ny * w;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              const j = nrow + nx;
              const mj = mat[j];
              if (mj === MAT.URANIUM) {
                mat[j] = MAT.PLASMA;
                for (let k = 0; k < 3; k++) {
                  const sx = nx + Math.round((world.rand() - 0.5) * 4);
                  const sy = ny + Math.round((world.rand() - 0.5) * 4);
                  if (world.inBounds(sx, sy)) {
                    const si = sy * w + sx;
                    if (mat[si] === MAT.EMPTY || mat[si] === MAT.URANIUM) {
                      mat[si] = MAT.NEUTRON;
                      const ang = world.rand() * Math.PI * 2;
                      world.vx[si] = Math.cos(ang) * 4.2;
                      world.vy[si] = Math.sin(ang) * 4.2;
                      world.meta[si] = 220;
                    }
                  }
                }
                world.addImpulseExplosion(nx, ny, 28, 2.65, 6800);
                mat[i] = MAT.PLASMA;
                dy = 2;
                break;
              } else if (mj === MAT.LEAD) {
                temp[j] += 18;
                mat[i] = MAT.EMPTY;
                dy = 2;
                break;
              }
            }
          }
        }
      }
    }
  }
}
