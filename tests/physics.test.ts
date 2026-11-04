import { describe, expect, it } from 'vitest';
import { DEMO_SCENES } from '../src/engine/Demos';
import { SimulationEngine } from '../src/engine/SimulationEngine';
import { ThermalSolver } from '../src/engine/ThermalSolver';
import { MAT, SELECTABLE_MATERIALS } from '../src/materials/registry';
import { GameSettings } from '../src/types/physics';

const TEST_SETTINGS: GameSettings = {
  computeMode: 'gpu90',
  substeps: 3,
  resolutionPreset: 'standard',
  hdrBloom: true,
  bloomIntensity: 0.7,
  realisticTextures: true,
  refractionAndSpec: true,
  heatShimmer: true,
  airVectorsOverlay: false,
  structuralStress: true,
  soundEnabled: false,
  soundVolume: 0,
  showCrosshairInfo: true,
};

describe('PIXPHYSO Real Multi-Physics Verification', () => {
  it('registers 60+ distinct selectable materials, electrical devices, gases, liquids, and tools', () => {
    expect(SELECTABLE_MATERIALS.length).toBeGreaterThanOrEqual(60);
    const names = SELECTABLE_MATERIALS.map((m) => m.name);
    for (const required of [
      'Кирпич',
      'Дерево',
      'Сталь',
      'Стекло',
      'Песок',
      'Земля',
      'Соль',
      'Сахар',
      'Ртуть',
      'Вода',
      'Лава',
      'Моторное масло',
      'Аккумулятор',
      'Генератор',
      'Кнопка',
      'Тумблер',
      'Вентилятор',
      'Огонь',
      'Разряд энергии',
      'Рука (Захват)',
    ]) {
      expect(names).toContain(required);
    }
  });

  it('eliminates corner air pockets and achieves flat hydrostatic surface + capillary absorption in Oil Absorption demo', () => {
    const engine = new SimulationEngine(TEST_SETTINGS);
    const oilDemo = DEMO_SCENES.find((d) => d.id === 'oil_absorption')!;
    oilDemo.build(engine.world);

    for (let f = 0; f < 100; f++) {
      engine.stepFrame(TEST_SETTINGS, true);
    }

    const w = engine.world;
    const L = Math.round(w.width * 0.14);
    const B = w.height - 24;

    // Bottom-left interior corner right inside brick wall must NOT have empty air trapped under oil!
    let emptyInBottomLeftCorner = 0;
    for (let y = B - 12; y <= B - 7; y++) {
      for (let x = L + 8; x <= L + 16; x++) {
        if (w.mat[y * w.width + x] === MAT.EMPTY) {
          emptyInBottomLeftCorner++;
        }
      }
    }
    expect(emptyInBottomLeftCorner).toBe(0);

    // Verify Sand and Sponge actually absorbed Motor Oil via capillary pores
    let oilyPores = 0;
    for (let i = 0; i < w.size; i++) {
      if ((w.mat[i] === MAT.SAND || w.mat[i] === MAT.SPONGE) && w.wetness[i] > 0 && w.absorbedMat[i] === MAT.MOTOR_OIL) {
        oilyPores++;
      }
    }
    expect(oilyPores).toBeGreaterThan(25);
  });

  it('stratifies Gold > Mercury > Iron > Water > Motor Oil according to real Archimedes density', () => {
    const engine = new SimulationEngine(TEST_SETTINGS);
    const w = engine.world;
    w.clear();

    // Build beaker
    for (let y = 100; y <= 220; y++) {
      w.setCell(180, y, MAT.STEEL);
      w.setCell(240, y, MAT.STEEL);
    }
    for (let x = 180; x <= 240; x++) {
      w.setCell(x, 220, MAT.STEEL);
    }

    // Pour inverted order: Oil at bottom, Water middle, Mercury above, Gold & Iron at very top!
    for (let x = 185; x <= 235; x++) {
      for (let y = 205; y <= 218; y++) w.setCell(x, y, MAT.MOTOR_OIL);
      for (let y = 188; y <= 203; y++) w.setCell(x, y, MAT.WATER);
      for (let y = 172; y <= 186; y++) w.setCell(x, y, MAT.MERCURY);
    }
    for (let x = 195; x <= 205; x++) {
      w.setCell(x, 160, MAT.GOLD);
      w.setCell(x + 15, 160, MAT.IRON_FILINGS);
    }

    for (let f = 0; f < 130; f++) {
      engine.stepFrame(TEST_SETTINGS, true);
    }

    const avgY = (targetMat: number): number => {
      let sumY = 0;
      let cnt = 0;
      for (let y = 100; y < 220; y++) {
        for (let x = 181; x < 240; x++) {
          if (w.mat[y * w.width + x] === targetMat) {
            sumY += y;
            cnt++;
          }
        }
      }
      return cnt > 0 ? sumY / cnt : 0;
    };

    const yGold = avgY(MAT.GOLD);
    const yMerc = avgY(MAT.MERCURY);
    const yIron = avgY(MAT.IRON_FILINGS);
    const yWater = avgY(MAT.WATER);
    const yOil = avgY(MAT.MOTOR_OIL);

    // Larger Y = deeper toward bottom!
    expect(yGold).toBeGreaterThan(yMerc);   // Gold (19320) sinks under Mercury (13546)!
    expect(yMerc).toBeGreaterThan(yIron);   // Iron (5200) floats on Mercury!
    expect(yMerc).toBeGreaterThan(yWater);  // Mercury below Water
    expect(yWater).toBeGreaterThan(yOil);   // Motor Oil floats on top of Water!
  });

  it('drives water up the right arm of a U-tube via Pascal hydrostatic pressure (Communicating Vessels)', () => {
    const engine = new SimulationEngine(TEST_SETTINGS);
    const uTube = DEMO_SCENES.find((d) => d.id === 'communicating_vessels')!;
    uTube.build(engine.world);

    const w = engine.world;
    const midR = Math.round(w.width * 0.56);
    const R = Math.round(w.width * 0.78);
    const botY = w.height - 22;

    // Initially right arm above channel top (botY - 35) has ZERO water
    let initialRightWater = 0;
    for (let y = 60; y < botY - 35; y++) {
      for (let x = midR + 1; x < R - 6; x++) {
        if (w.mat[y * w.width + x] === MAT.WATER) initialRightWater++;
      }
    }
    expect(initialRightWater).toBe(0);

    for (let f = 0; f < 160; f++) {
      engine.stepFrame(TEST_SETTINGS, true);
    }

    let finalRightWater = 0;
    for (let y = 60; y < botY - 35; y++) {
      for (let x = midR + 1; x < R - 6; x++) {
        if (w.mat[y * w.width + x] === MAT.WATER) finalRightWater++;
      }
    }
    expect(finalRightWater).toBeGreaterThan(400);
  });

  it('obeys Clausius-Clapeyron pressure-dependent boiling of water in near-vacuum', () => {
    expect(ThermalSolver.boilingPointAtPressure(100, 101.325)).toBeCloseTo(100, 1);
    expect(ThermalSolver.boilingPointAtPressure(100, 1.5)).toBeLessThan(18);

    const engine = new SimulationEngine(TEST_SETTINGS);
    const w = engine.world;
    w.clear();
    w.env.ambientTempC = 22;
    w.env.pressureKPa = 1.0; // Vacuum chamber!

    for (let x = 200; x <= 220; x++) {
      for (let y = 200; y <= 210; y++) {
        w.setCell(x, y, MAT.WATER, 22);
      }
    }

    for (let f = 0; f < 25; f++) {
      engine.stepFrame(TEST_SETTINGS, true);
    }

    let steamCount = 0;
    for (let i = 0; i < w.size; i++) {
      if (w.mat[i] === MAT.STEAM) steamCount++;
    }
    expect(steamCount).toBeGreaterThan(20);
  });

  it('conducts electricity through Switches to heat Nichrome coils and boost Fans, and opens circuit when toggled OFF', () => {
    const engine = new SimulationEngine(TEST_SETTINGS);
    const w = engine.world;
    w.clear();

    // Generator -> Wire -> Switch (OFF initially) -> Wire -> Heater + Fan
    w.setCell(100, 150, MAT.GENERATOR);
    w.setCell(101, 150, MAT.COPPER_WIRE);
    w.setCell(102, 150, MAT.SWITCH);
    w.meta[150 * w.width + 102] = 0; // Switch OFF
    w.setCell(103, 150, MAT.COPPER_WIRE);
    w.setCell(104, 150, MAT.HEATER);
    w.setCell(105, 150, MAT.FAN);

    for (let f = 0; f < 15; f++) {
      engine.stepFrame(TEST_SETTINGS, true);
    }
    const heaterIdx = 150 * w.width + 104;
    expect(w.volt[heaterIdx]).toBeLessThan(0.5);
    const coldTemp = w.temp[heaterIdx];

    // Click the Switch to turn it ON!
    expect(w.interactClickAt(102, 150)).toBe(true);
    for (let f = 0; f < 30; f++) {
      engine.stepFrame(TEST_SETTINGS, true);
    }

    expect(w.volt[heaterIdx]).toBeGreaterThan(20);
    expect(w.temp[heaterIdx]).toBeGreaterThan(coldTemp + 35);
    const fanAirIdx = w.airIdxFromCell(106, 150);
    expect(w.airVx[fanAirIdx]).toBeGreaterThan(5);
  });

  it('tears pixel structures free when yanked with the Hand tool beyond tensile strength', () => {
    const engine = new SimulationEngine(TEST_SETTINGS);
    const w = engine.world;
    w.clear();

    for (let x = 180; x <= 220; x++) {
      for (let y = 140; y <= 146; y++) {
        w.setCell(x, y, MAT.WOOD);
      }
    }

    engine.startHandGrab(200, 143, 5);
    expect(w.hand.active).toBe(true);
    expect(w.hand.detached).toBe(false);

    // Pull strongly upward
    engine.moveHandGrab(200, 95);
    engine.stepFrame(TEST_SETTINGS, true);

    expect(w.hand.detached).toBe(true);
    expect(w.hand.cluster.length).toBeGreaterThan(10);
  });
});
