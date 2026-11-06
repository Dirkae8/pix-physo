import { describe, expect, it } from 'vitest';
import { ELEMENT_MODULES } from '../src/materials/elements';
import {
  describeElement,
  ELEMENT_BRUSH_HOOKS,
  ELEMENT_BY_ID,
  ELEMENT_STEP_HOOKS,
  ELEMENT_VOLTAGE_HOOKS,
  installElement,
  SHEET_LUT,
} from '../src/materials/elementRegistry';
import { chancePerTick, defineElement } from '../src/materials/elementApi';
import { MAX_MAT_ID, MATERIAL_BY_ID, SELECTABLE_MATERIALS, XMAT } from '../src/materials/registry';
import { MODS } from '../src/mods/index';
import { World } from '../src/engine/World';
import { SimulationEngine } from '../src/engine/SimulationEngine';
import { ChemistrySolver } from '../src/engine/ChemistrySolver';
import { ThermalSolver } from '../src/engine/ThermalSolver';
import { MAT } from '../src/materials/registry';
import type { GameSettings } from '../src/types/physics';

const settings = { resolutionPreset: 'standard' } as GameSettings;

describe('модульная архитектура: файл на каждый элемент', () => {
  it('каждый элемент содержит характеристики, реакции и поведение', () => {
    expect(ELEMENT_MODULES.length).toBe(251);
    expect(new Set(ELEMENT_MODULES.map(e => e.def.id)).size).toBe(251);
    for (const e of ELEMENT_MODULES) {
      expect(e.def.id).toBeGreaterThanOrEqual(0);
      expect(e.def.id).toBeLessThan(MAX_MAT_ID);
      expect(e.def.name).toBeTruthy();
      expect(typeof e.def.density).toBe('number');
      expect(Array.isArray(e.reactions)).toBe(true);
      expect(typeof e.behavior).toBe('object');
      expect(e.mod).toBeTruthy();
      expect(MATERIAL_BY_ID[e.def.id]).toBe(e.def);
      expect(ELEMENT_BY_ID[e.def.id]).toBe(e);
    }
  });

  it('манифесты модов покрывают весь каталог', () => {
    expect(MODS.length).toBe(6);
    const covered = new Set(MODS.flatMap(m => [...m.elements]));
    expect(covered.size).toBe(ELEMENT_MODULES.length);
    for (const m of MODS) expect(m.elements.length).toBeGreaterThan(0);
  });

  it('в «Твёрдых» только твёрдые, бумага и картон — листы, а не сыпучее', () => {
    for (const e of ELEMENT_MODULES) {
      const { category, state, id } = e.def;
      if (state === 'empty' || state === 'energy' || state === 'tool') continue;
      if (category === 'solids') expect(state, `${e.def.key}`).toBe('solid');
      if (category === 'powders') expect(state, `${e.def.key}`).toBe('powder');
      if (category === 'liquids') expect(state, `${e.def.key}`).toBe('liquid');
      if (category === 'gases') expect(state, `${e.def.key}`).toBe('gas');
      if (SHEET_LUT[id]) {
        expect(state).toBe('solid');
        expect(e.behavior.granular).toBeFalsy();
      }
    }
    expect(MATERIAL_BY_ID[XMAT.PAPER].state).toBe('solid');
    expect(MATERIAL_BY_ID[XMAT.CARDBOARD].state).toBe('solid');
    expect(MATERIAL_BY_ID[XMAT.WICK].state).toBe('solid');
    expect(SHEET_LUT[XMAT.PAPER]).toBe(1);
    expect(SELECTABLE_MATERIALS.filter(m => m.category === 'solids').length).toBeGreaterThan(20);
  });

  it('специальные реакции вынесены в файлы элементов, а не в switch движка', () => {
    expect(ELEMENT_STEP_HOOKS[XMAT.DRY_WATER]).toBeTypeOf('function');
    expect(ELEMENT_STEP_HOOKS[XMAT.BAKING_SODA]).toBeTypeOf('function');
    expect(ELEMENT_VOLTAGE_HOOKS[XMAT.PIEZO]).toBeTypeOf('function');
    expect(ELEMENT_VOLTAGE_HOOKS[XMAT.THERMOCOUPLE]).toBeTypeOf('function');
    expect(ELEMENT_BRUSH_HOOKS[XMAT.TOOL_MAGNET]).toBeTypeOf('function');
    expect(ELEMENT_BRUSH_HOOKS[XMAT.TOOL_VACUUM]).toBeTypeOf('function');
    expect(describeElement(XMAT.PAPER)).toContain('Возгорание');
    expect(() => installElement(defineElement({
      mod: 'test', tags: [], summary: '', def: { ...MATERIAL_BY_ID[XMAT.PAPER] }, reactions: [], behavior: {},
    }))).toThrow();
  });
});

describe('реальное время 1× и скорости реакций', () => {
  it('переводит скорость 1/с в вероятность такта', () => {
    expect(chancePerTick(0, 1 / 60)).toBe(0);
    expect(chancePerTick(60, 1 / 60)).toBeCloseTo(1 - Math.exp(-1), 6);
    expect(chancePerTick(0.19, 1 / 60)).toBeLessThan(0.01);
  });

  it('1× идёт секунда в секунду и не зависит от FPS', () => {
    const e = new SimulationEngine(settings);
    expect(e.world.dtSeconds).toBeCloseTo(1 / 60, 6);
    for (let n = 0; n < 60; n++) e.stepFrame(settings, false, 1 / 60);
    expect(e.world.timeSec).toBeCloseTo(1, 2);
    const e2 = new SimulationEngine(settings);
    for (let n = 0; n < 30; n++) e2.stepFrame(settings, false, 1 / 30);
    expect(e2.world.timeSec).toBeCloseTo(1, 2);
    // Один кадр с огромной задержкой не должен «догонять» десять секунд.
    const e3 = new SimulationEngine(settings);
    e3.stepFrame(settings, false, 10);
    expect(e3.world.timeSec).toBeLessThanOrEqual(8 / 60 + 1e-6);
  });

  it('ускорение 4× увеличивает число тактов, но не длительность такта', () => {
    const e = new SimulationEngine(settings);
    e.speedMultiplier = 4;
    for (let n = 0; n < 15; n++) e.stepFrame(settings, false, 1 / 60);
    expect(e.world.dtSeconds).toBeCloseTo(1 / 60, 6);
    expect(e.world.timeSec).toBeCloseTo(1, 2);
  });

  it('вода не вскипает за одну реальную секунду', () => {
    const w = new World(30, 20); w.applyPreset('home');
    let total = 0;
    for (let y = 4; y < 16; y++) for (let x = 4; x < 26; x++) { w.setCell(x, y, MAT.WATER, 105); total++; }
    const thermal = new ThermalSolver(w.size);
    for (let t = 0; t < 60; t++) thermal.step(w, true);
    let steam = 0;
    for (let i = 0; i < w.size; i++) if (w.mat[i] === MAT.STEAM) steam++;
    expect(steam).toBeLessThan(total * 0.3);
  });

  it('огонь живёт дольше секунды и не гаснет за кадр', () => {
    const w = new World(16, 16); w.applyPreset('home');
    const i = w.idx(8, 8);
    w.setCell(8, 8, MAT.FIRE);
    const chem = new ChemistrySolver();
    for (let t = 0; t < 60; t++) chem.step(w);
    expect(w.mat[i]).toBe(MAT.FIRE);
    expect(w.wetness[i]).toBeGreaterThan(0);
  });

  it('холодная вода не даёт густой пар', () => {
    const w = new World(30, 20); w.applyPreset('home');
    let total = 0;
    for (let y = 4; y < 16; y++) for (let x = 4; x < 26; x++) { w.setCell(x, y, MAT.WATER, 30); total++; }
    const thermal = new ThermalSolver(w.size), chem = new ChemistrySolver();
    for (let t = 0; t < 180; t++) { thermal.step(w, true); chem.step(w); }
    let vapor = 0;
    for (let i = 0; i < w.size; i++) {
      if (w.mat[i] === MAT.WATER_VAPOR || w.mat[i] === MAT.STEAM) vapor++;
    }
    expect(vapor).toBeLessThan(Math.max(2, total * 0.03));
  });

  it('водяной пар конденсируется, а не копился вечно', () => {
    const w = new World(12, 12); w.applyPreset('home');
    const i = w.idx(5, 5);
    w.setCell(5, 5, MAT.WATER_VAPOR, 30);
    const chem = new ChemistrySolver();
    for (let t = 0; t < 240; t++) chem.step(w);
    expect(w.mat[i]).not.toBe(MAT.WATER_VAPOR);
  });

  it('фитиль с топливом держит пламя, а огонь рядом с топливом не гаснет', () => {
    const w = new World(16, 16); w.applyPreset('home');
    const wick = w.idx(6, 8);
    w.setCell(6, 8, XMAT.WICK, 250);
    w.absorbedMat[wick] = XMAT.VEGETABLE_OIL;
    w.wetness[wick] = 200;
    const chem = new ChemistrySolver();
    for (let t = 0; t < 90; t++) { w.temp[wick] = Math.max(w.temp[wick], 250); chem.step(w); }
    expect(w.mat[wick - w.width]).toBe(MAT.FIRE);

    const w2 = new World(16, 16); w2.applyPreset('home');
    const fire = w2.idx(8, 8);
    w2.setCell(8, 8, MAT.FIRE);
    w2.setCell(8, 9, MAT.WOOD, 400);
    const chem2 = new ChemistrySolver();
    for (let t = 0; t < 180; t++) chem2.step(w2);
    expect(w2.mat[fire]).toBe(MAT.FIRE);
  });

  it('при просадке FPS физика не размножается (нет спирали смерти)', () => {
    const e = new SimulationEngine(settings);
    // Один кадр с задержкой 200 мс не должен сделать больше 2 тактов.
    e.stepFrame(settings, false, 0.2);
    expect(e.world.timeSec).toBeLessThanOrEqual(2 / 60 + 1e-6);
  });

  it('активные строки пропускают пустые области без потери физики', () => {
    const w = new World(40, 40);
    w.setCell(10, 20, MAT.STEEL);
    w.refreshActivity();
    expect(w.rowActive[20]).toBe(1);
    expect(w.rowActive[19]).toBe(2);
    expect(w.rowActive[21]).toBe(2);
    expect(w.rowActive[2]).toBe(0);
  });
});
