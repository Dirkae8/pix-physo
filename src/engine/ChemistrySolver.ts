import {
  ABSORBABLE_LUT,
  BURN_PRODUCT_LUT,
  BURN_RATE_LUT,
  CAPILLARY_LUT,
  CARBONATE_LUT,
  ELEMENT_STEP_HOOKS,
  FLAME_COLOR_LUT,
  FUME_LUT,
  NEEDS_ELEMENT_STEP_LUT,
  SELF_OXIDIZER_LUT,
  SMOTHERS_LUT,
} from '../materials/elementRegistry';
import { chancePerTick } from '../materials/elementApi';
import { MAT, MATERIAL_BY_ID, MAX_MAT_ID, POROSITY_LUT } from '../materials/registry';
import { World } from './World';

const DX4 = [0, -1, 1, 0];
const DY4 = [-1, 0, 0, 1];

// Плоские таблицы вместо обращений к объектам определений в горячем цикле.
const FLAMMABILITY_LUT = new Float32Array(MAX_MAT_ID);
const IGNITION_LUT = new Float32Array(MAX_MAT_ID);
const BURN_HEAT_LUT = new Float32Array(MAX_MAT_ID);
const EXPLOSIVE_LUT = new Float32Array(MAX_MAT_ID);
const DETONATION_LUT = new Float32Array(MAX_MAT_ID);
const IS_GAS_LUT = new Uint8Array(MAX_MAT_ID);
const ACID_RES_LUT = new Float32Array(MAX_MAT_ID);
const METALLIC_LUT = new Float32Array(MAX_MAT_ID);
for (let id = 0; id < MAX_MAT_ID; id++) {
  const d = MATERIAL_BY_ID[id];
  FLAMMABILITY_LUT[id] = d.flammability;
  IGNITION_LUT[id] = d.ignitionTempC ?? Infinity;
  BURN_HEAT_LUT[id] = d.burnHeat ?? 40;
  EXPLOSIVE_LUT[id] = d.explosivePower ?? 0;
  DETONATION_LUT[id] = d.detonationShockKPa ?? Infinity;
  IS_GAS_LUT[id] = d.state === 'gas' ? 1 : 0;
  ACID_RES_LUT[id] = d.acidResistance;
  METALLIC_LUT[id] = d.metallic;
}

/** Клетки, требующие химического шага; особые хуки элементов тоже попадают сюда. */
const NEEDS_CHEM_LUT = new Uint8Array(MAX_MAT_ID);
for (let id = 1; id < MAX_MAT_ID; id++) {
  const d = MATERIAL_BY_ID[id];
  if (
    DETONATION_LUT[id] !== Infinity ||
    FLAMMABILITY_LUT[id] > 0 ||
    d.porosity > 0 ||
    d.waterSoluble ||
    NEEDS_ELEMENT_STEP_LUT[id] ||
    FUME_LUT[id] ||
    id === MAT.FIRE || id === MAT.PLASMA || id === MAT.ELECTRIC_ARC ||
    id === MAT.EMBER || id === MAT.SMOKE || id === MAT.STEAM ||
    id === MAT.THERMITE || id === MAT.CEMENT || id === MAT.SODIUM ||
    id === MAT.ACID || id === MAT.CHLORINE || id === MAT.NEUTRON
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
    const dt = world.dtSeconds;

    // Разреженное Монте-Карло для медленного ржавления (скорость в 1/с).
    const expectedRustSamples = world.size * 0.0009 * dt * (world.env.humidity / 100);
    const rustSamples = Math.ceil(expectedRustSamples);
    for (let n = 0; n < rustSamples; n++) {
      const i = Math.floor(world.rand() * world.size);
      if (world.rand() >= expectedRustSamples / rustSamples) continue;
      if (mat[i] !== MAT.STEEL && mat[i] !== MAT.IRON_FILINGS) continue;
      const x = i % w, y = (i / w) | 0;
      for (let d = 0; d < 4; d++) {
        const nx = x + DX4[d], ny = y + DY4[d];
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const nm = mat[ny * w + nx];
          if (nm === MAT.WATER || nm === MAT.SALTWATER || nm === MAT.SEAWATER) { mat[i] = MAT.RUST; break; }
        }
      }
    }

    for (let y = 0; y < h; y++) {
      if (!world.rowActive[y]) continue;
      const row = y * w;
      const x0 = world.rowMinX[y], x1 = world.rowMaxX[y];
      for (let x = x0; x <= x1; x++) {
        const i = row + x;
        const m = mat[i];
        if (!NEEDS_CHEM_LUT[m]) continue;
        const t = temp[i];

        // Индивидуальная логика элемента живёт в его собственном файле.
        const hook = ELEMENT_STEP_HOOKS[m];
        if (hook) {
          hook(world, i, x, y, dt);
          if (mat[i] !== m) continue;
        }

        // 1. Симпатическая детонация от ударной волны.
        if (DETONATION_LUT[m] !== Infinity) {
          const ai = world.airIdxFromCell(x, y);
          const vx = world.vx[i], vy = world.vy[i];
          if (airP[ai] > DETONATION_LUT[m] ||
              (m === MAT.NITROGLYCERIN && vx * vx + vy * vy > 11.56 &&
               y + 1 < h && mat[i + w] !== MAT.EMPTY && mat[i + w] !== m)) {
            const pwr = EXPLOSIVE_LUT[m] || 1.2;
            mat[i] = MAT.PLASMA;
            world.addImpulseExplosion(x, y, Math.round(14 * pwr), pwr, 3200);
            continue;
          }
        }

        // 2. Жизненный цикл пламени, плазмы, дуги и дымов.
        if (m === MAT.FIRE || m === MAT.PLASMA || m === MAT.ELECTRIC_ARC || m === MAT.EMBER ||
            m === MAT.SMOKE || m === MAT.STEAM || FUME_LUT[m]) {
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
                if (m === MAT.FIRE && SMOTHERS_LUT[nm]) smothered = true;
                else if (nm === MAT.OXYGEN) {
                  oxygenBoost = true;
                  if (world.rand() < chancePerTick(15, dt)) mat[nrow + nx] = MAT.FIRE;
                } else if (nm === 201 || nm === 202) oxygenBoost = true; // озон, закись азота
              }
            }
            const oxygenCell = world.airIdxFromCell(x, y);
            const oxygenPartialPressure = world.airOxygen[oxygenCell] * Math.max(0, world.env.pressureKPa + airP[oxygenCell]);
            if (m === MAT.FIRE && !oxygenBoost && oxygenPartialPressure < 1.2) smothered = true;
            if (smothered) {
              mat[i] = m === MAT.FIRE ? MAT.SMOKE : MAT.STEAM;
              wet[i] = 140;
              continue;
            }
            if (m === MAT.FIRE && !oxygenBoost) {
              world.airOxygen[oxygenCell] = Math.max(0, world.airOxygen[oxygenCell] - 0.048 * dt);
            }
            if (oxygenBoost) temp[i] = Math.min(3600, temp[i] + 8400 * dt);

            // Огонь живёт, пока рядом есть горячее топливо: фитиль с маслом,
            // дерево, уголь, масло — пламя не «выгорает» за пару секунд.
            let fed = false;
            if (m === MAT.FIRE) {
              for (let d = 0; d < 4; d++) {
                const nx = x + DX4[d], ny = y + DY4[d];
                if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
                const j = ny * w + nx, nm = mat[j];
                if (FLAMMABILITY_LUT[nm] > 0 && temp[j] > IGNITION_LUT[nm] * 0.4) { fed = true; break; }
              }
            }
            if (fed) {
              if (wet[i] < 210) wet[i] = Math.min(255, wet[i] + 12);
            } else {
              // Угасание привязано к реальному времени, а не к частоте кадров.
              const base = m === MAT.ELECTRIC_ARC ? 16 : m === MAT.PLASMA ? 8 : 3;
              const decay = Math.max(1, Math.round(base * dt * 12));
              if (wet[i] <= decay) {
                mat[i] = m === MAT.FIRE && world.rand() < 0.28 ? MAT.SMOKE : MAT.EMPTY;
                wet[i] = mat[i] === MAT.SMOKE ? 150 : 0;
              } else {
                wet[i] -= decay;
              }
            }
          } else if (m === MAT.EMBER) {
            if (t < 550 || world.rand() < chancePerTick(1.5, dt)) mat[i] = MAT.EMPTY;
          } else if (m !== MAT.STEAM) {
            if (wet[i] <= 1) mat[i] = MAT.EMPTY;
            else if (world.rand() < chancePerTick(3.6, dt)) wet[i]--;
          }
          continue;
        }

        // 3. Термит: самоподдерживающаяся реакция 2500 °C.
        if (m === MAT.THERMITE) {
          if (wet[i] === 0 && t >= 680) wet[i] = 90 + (world.randByte() & 63);
          if (wet[i] > 0) {
            temp[i] = Math.max(temp[i], 2550);
            wet[i] -= Math.max(1, Math.round(180 * dt));
            if (y > 0 && mat[i - w] === MAT.EMPTY && world.rand() < chancePerTick(15, dt)) {
              mat[i - w] = MAT.EMBER; temp[i - w] = 2200;
              world.vx[i - w] = (world.rand() - 0.5) * 3.5;
              world.vy[i - w] = -1.5 - world.rand() * 2.5;
            }
            if (wet[i] <= 3) { mat[i] = MAT.MOLTEN_METAL; temp[i] = 2400; }
            continue;
          }
        }

        // 4. Горение. Все вероятности заданы скоростями в 1/секунду.
        if (FLAMMABILITY_LUT[m] > 0 && IGNITION_LUT[m] !== Infinity) {
          let nearFlame = false;
          let hasOxidizer = SELF_OXIDIZER_LUT[m] === 1;
          let nearPureO2 = false;
          let oxygenNeighbors = 0;

          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const nrow = ny * w;
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              const nm = mat[nrow + nx];
              if (nm === MAT.FIRE || nm === MAT.PLASMA || nm === MAT.ELECTRIC_ARC ||
                  nm === MAT.LAVA || nm === MAT.EMBER || nm === MAT.MOLTEN_METAL) {
                nearFlame = true;
              } else if (nm === MAT.EMPTY) {
                const ai = world.airIdxFromCell(x, y);
                hasOxidizer ||= world.airOxygen[ai] * Math.max(0, world.env.pressureKPa + airP[ai]) > 1.2;
                oxygenNeighbors++;
              } else if (nm === MAT.OXYGEN || nm === 201 || nm === 202) {
                hasOxidizer = true; nearPureO2 = true; oxygenNeighbors += 3;
              }
            }
          }

          if (hasOxidizer && (t >= IGNITION_LUT[m] || (nearFlame && t >= IGNITION_LUT[m] * 0.45))) {
            const rate = FLAMMABILITY_LUT[m] * 21 * (nearPureO2 ? 2.8 : nearFlame ? 1.0 : 0.35);
            if (world.rand() < chancePerTick(rate, dt)) {
              if (!IS_GAS_LUT[m] && EXPLOSIVE_LUT[m] >= 0.6) {
                const pwr = EXPLOSIVE_LUT[m] * (nearPureO2 ? 1.45 : 1.0);
                mat[i] = MAT.FIRE;
                world.addImpulseExplosion(x, y, Math.max(6, Math.round(13 * pwr)), pwr, 2400);
                continue;
              }

              const heatAdd = BURN_HEAT_LUT[m] * (nearPureO2 ? 2.4 : 1.0);
              temp[i] += heatAdd;
              if (y > 0 && (mat[i - w] === MAT.EMPTY || mat[i - w] === MAT.OXYGEN)) {
                mat[i - w] = MAT.FIRE;
                temp[i - w] = 950 + heatAdd * 4;
                wet[i - w] = 195 + (world.randByte() & 60);
                world.meta[i - w] = FLAME_COLOR_LUT[m];
                if (oxygenNeighbors <= 2 && world.rand() < 0.12) { mat[i - w] = MAT.SOOT; world.meta[i - w] = 0; }
              }

              const burnRate = BURN_RATE_LUT[m] || 10.5;
              if (world.rand() < chancePerTick(burnRate, dt)) {
                const product = BURN_PRODUCT_LUT[m];
                mat[i] = product >= 0 ? product : (m === MAT.ETHANOL ? MAT.STEAM : MAT.FIRE);
                wet[i] = 120;
                continue;
              }
            }
          }
        }

        // 5. Капиллярное впитывание и диффузия по порам.
        const por = POROSITY_LUT[m];
        if (por > 0) {
          const maxCap = (por * 250) | 0;
          const strength = CAPILLARY_LUT[m] || 135;
          if (wet[i] < maxCap) {
            for (let d = 0; d < 4; d++) {
              const nx = x + DX4[d], ny = y + DY4[d];
              if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
              const j = ny * w + nx, mj = mat[j];
              if (ABSORBABLE_LUT[mj] && (absMat[i] === 0 || absMat[i] === mj)) {
                if (wet[i] + strength <= maxCap + 30) {
                  absMat[i] = mj;
                  wet[i] = Math.min(255, wet[i] + strength);
                  mat[j] = MAT.EMPTY;
                  break;
                }
              } else if (POROSITY_LUT[mj] > 0 && wet[j] > wet[i] + 18 && absMat[j] !== 0) {
                if (absMat[i] === 0 || absMat[i] === absMat[j]) {
                  const transfer = Math.min(maxCap - wet[i], (wet[j] - wet[i]) >> 2);
                  if (transfer > 0) { absMat[i] = absMat[j]; wet[i] += transfer; wet[j] -= transfer; }
                }
              }
            }
          }
          if (wet[i] > 20 && absMat[i] !== 0) {
            const absorbed = absMat[i];
            if ((SMOTHERS_LUT[absorbed] || absorbed === MAT.WATER) && t > 105) {
              wet[i] = Math.max(0, wet[i] - Math.max(1, Math.round(1080 * dt)));
              if (wet[i] === 0) absMat[i] = 0;
              if (y > 0 && mat[i - w] === MAT.EMPTY) { mat[i - w] = MAT.STEAM; wet[i - w] = 150; }
            } else if (FLAMMABILITY_LUT[absorbed] > 0 && t > IGNITION_LUT[absorbed]) {
              wet[i] = Math.max(0, wet[i] - Math.max(1, Math.round(480 * dt)));
              temp[i] += 18;
              if (y > 0 && mat[i - w] === MAT.EMPTY && world.rand() < chancePerTick(21, dt)) {
                mat[i - w] = MAT.FIRE; wet[i - w] = 110;
              }
              if (wet[i] === 0) absMat[i] = 0;
            }
          }
        }

        // 6. Растворение соли и сахара.
        if (m === MAT.SALT || m === MAT.SUGAR) {
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d], ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx;
            if (mat[j] === MAT.WATER && world.rand() < chancePerTick(2.7 + Math.max(0, temp[j]) * 0.09, dt)) {
              mat[j] = m === MAT.SALT ? MAT.SALTWATER : MAT.SYRUP;
              if (m === MAT.SALT) temp[j] -= 0.3;
              mat[i] = MAT.EMPTY;
              break;
            }
          }
          if (mat[i] === MAT.EMPTY) continue;
        }

        // 7. Цемент + вода → бетон.
        if (m === MAT.CEMENT) {
          let touchingWater = false;
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d], ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx;
            if (mat[j] === MAT.WATER || mat[j] === MAT.SALTWATER) {
              touchingWater = true;
              if (world.rand() < chancePerTick(1.5, dt)) mat[j] = MAT.EMPTY;
            }
          }
          if (touchingWater || wet[i] > 0) {
            wet[i] = Math.min(255, wet[i] + (touchingWater ? 6 : 2));
            temp[i] += 0.06;
            if (wet[i] >= 180) { mat[i] = MAT.CONCRETE; wet[i] = 0; continue; }
          }
        }

        // 8. Натрий + вода.
        if (m === MAT.SODIUM) {
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d], ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx, mj = mat[j];
            if (mj === MAT.WATER || mj === MAT.SALTWATER || mj === MAT.ACID || mj === MAT.ICE) {
              mat[j] = MAT.HYDROGEN; wet[j] = 220;
              temp[i] += 260; temp[j] = 420;
              world.vx[i] += (world.rand() - 0.5) * 4; world.vy[i] -= 1.8;
              world.events.sizzleCount += 2;
              if (world.rand() < 0.25) { mat[i] = MAT.FIRE; world.addImpulseExplosion(x, y, 12, 0.85, 1800); }
              break;
            }
          }
          if (mat[i] !== MAT.SODIUM) continue;
        }

        // 9. Кислотные реакции.
        if (m === MAT.ACID) {
          for (let d = 0; d < 4; d++) {
            const nx = x + DX4[d], ny = y + DY4[d];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const j = ny * w + nx, mj = mat[j];
            if (mj === MAT.EMPTY || mj === MAT.ACID) continue;
            if (mj === MAT.ALKALI) {
              mat[i] = MAT.SALTWATER; mat[j] = MAT.SALTWATER;
              temp[i] += 12; temp[j] += 12; world.events.sizzleCount++; break;
            }
            if (mj === MAT.SUGAR || mj === MAT.SYRUP) {
              mat[j] = MAT.CHARCOAL; temp[j] += 115;
              if (y > 0 && mat[i - w] === MAT.EMPTY) {
                mat[i - w] = world.rand() < 0.65 ? MAT.CHARCOAL : MAT.STEAM;
                temp[i - w] = 140;
              }
              if (world.rand() < 0.35) mat[i] = MAT.STEAM;
              world.events.sizzleCount++; break;
            }
            if (CARBONATE_LUT[mj]) {
              mat[j] = MAT.CO2; wet[j] = 160; temp[i] += 6; temp[j] += 8;
              if (world.rand() < 0.35) mat[i] = MAT.EMPTY;
              world.events.sizzleCount++; break;
            }
            if (ACID_RES_LUT[mj] < 0.92 && world.rand() < chancePerTick((1 - ACID_RES_LUT[mj]) * 5.7, dt)) {
              mat[j] = METALLIC_LUT[mj] > 0.5 ? MAT.HYDROGEN : MAT.SMOKE;
              wet[j] = 180; temp[i] += 28; temp[j] += 45;
              world.events.sizzleCount++;
              if (world.rand() < 0.42) mat[i] = MAT.EMPTY;
              break;
            }
          }
          continue;
        }

        // 10. Цепная реакция деления U-235.
        if (m === MAT.NEUTRON) {
          for (let dy = -1; dy <= 1; dy++) {
            const ny = y + dy;
            if (ny < 0 || ny >= h) continue;
            const nrow = ny * w;
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              if (nx < 0 || nx >= w) continue;
              const j = nrow + nx, mj = mat[j];
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
                      world.vx[si] = Math.cos(ang) * 4.2; world.vy[si] = Math.sin(ang) * 4.2;
                      world.meta[si] = 220;
                    }
                  }
                }
                world.addImpulseExplosion(nx, ny, 28, 2.65, 6800);
                mat[i] = MAT.PLASMA; dy = 2; break;
              } else if (mj === MAT.LEAD) {
                temp[j] += 18; mat[i] = MAT.EMPTY; dy = 2; break;
              }
            }
          }
        }
      }
    }
  }
}
