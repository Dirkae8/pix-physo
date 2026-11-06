import { describe, expect, it } from 'vitest';
import {
  EXPANSION_EXPLOSIVE_IDS,
  EXPANSION_LIQUID_IDS,
  EXPANSION_SELECTABLE_IDS,
  MAT,
  MAX_MAT_ID,
  MATERIAL_BY_ID,
  SELECTABLE_MATERIALS,
  XMAT,
  XSTATE,
} from '../src/materials/registry';
import { World } from '../src/engine/World';
import { SimulationEngine } from '../src/engine/SimulationEngine';
import { ChemistrySolver } from '../src/engine/ChemistrySolver';
import { ElectricSolver } from '../src/engine/ElectricSolver';
import { MechanicsSolver } from '../src/engine/MechanicsSolver';
import { ThermalSolver } from '../src/engine/ThermalSolver';
import type { GameSettings } from '../src/types/physics';

describe('расширение каталога на 100 предметов', () => {
  it('использует безопасный диапазон id и не ломает таблицу материалов', () => {
    expect(MAX_MAT_ID).toBe(256);
    expect(EXPANSION_SELECTABLE_IDS.size).toBe(100);
    const sorted = [...EXPANSION_SELECTABLE_IDS].sort((a, b) => a - b);
    expect(sorted[0]).toBe(145);
    expect(sorted[99]).toBe(244);
    expect(SELECTABLE_MATERIALS.length).toBeGreaterThanOrEqual(221);
    const ids = SELECTABLE_MATERIALS.map(m => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toBeGreaterThan(0);
      expect(id).toBeLessThan(256); // поле мира — Uint8Array
      expect(MATERIAL_BY_ID[id]).toBeDefined();
      expect(MATERIAL_BY_ID[id].id).toBe(id);
    }
    for (const id of EXPANSION_SELECTABLE_IDS) {
      expect(MATERIAL_BY_ID[id].selectable).toBe(true);
    }
    for (const id of Object.values(XSTATE)) {
      expect(MATERIAL_BY_ID[id].selectable).toBe(false);
    }
  });

  it('содержит все предметы, названные пользователем', () => {
    const names = Object.values(XMAT).map(id => MATERIAL_BY_ID[id].name);
    for (const expected of [
      'Фитиль', 'Пластик ABS', 'ПВХ', 'Полиэтилен', 'Кевлар',
      'Бумага', 'Картон', 'Пенопласт',
      'Куриный бульон', 'Сухая вода', 'Масло растительное',
      'Молоко', 'Уксус 9 %', 'Оливковое масло',
    ]) expect(names).toContain(expected);
    expect(MATERIAL_BY_ID[XMAT.KEVLAR].tensileStrength).toBeGreaterThan(MATERIAL_BY_ID[MAT.STEEL].tensileStrength);
    expect(MATERIAL_BY_ID[XMAT.STYROFOAM].density).toBeLessThan(MATERIAL_BY_ID[MAT.WATER].density);
    expect(MATERIAL_BY_ID[XMAT.STYROFOAM].thermalCond).toBeLessThan(0.02);
  });

  it('распределяет новые предметы по всем категориям и даёт 20 жидкостей + 10 взрывчаток', () => {
    const byCat = (c: string) => [...EXPANSION_SELECTABLE_IDS].filter(id => MATERIAL_BY_ID[id].category === c);
    for (const c of ['solids', 'powders', 'liquids', 'gases', 'electric', 'explosives', 'tools']) {
      expect(byCat(c).length).toBeGreaterThan(0);
    }
    expect(byCat('liquids').length).toBe(20);
    expect(EXPANSION_LIQUID_IDS).toHaveLength(20);
    expect(EXPANSION_EXPLOSIVE_IDS).toHaveLength(10);
    for (const id of EXPANSION_LIQUID_IDS) expect(MATERIAL_BY_ID[id].state).toBe('liquid');
    for (const id of EXPANSION_EXPLOSIVE_IDS) {
      expect(MATERIAL_BY_ID[id].explosivePower).toBeGreaterThan(0);
      expect(MATERIAL_BY_ID[id].detonationShockKPa).toBeGreaterThan(0);
    }
  });

  it('все фазовые переходы новых веществ ведут в существующие материалы', () => {
    for (const id of [...EXPANSION_SELECTABLE_IDS, ...Object.values(XSTATE)]) {
      const d = MATERIAL_BY_ID[id];
      for (const target of [d.meltInto, d.boilInto, d.freezeInto]) {
        if (target === undefined) continue;
        expect(target).toBeGreaterThan(0);
        expect(target).toBeLessThan(MAX_MAT_ID);
        expect(MATERIAL_BY_ID[target].name).toBeTruthy();
      }
    }
    expect(MATERIAL_BY_ID[XMAT.PLASTIC_ABS].meltInto).toBe(XSTATE.MOLTEN_PLASTIC);
    expect(MATERIAL_BY_ID[XSTATE.MOLTEN_PLASTIC].freezeInto).toBe(XMAT.PLASTIC_ABS);
    expect(MATERIAL_BY_ID[XMAT.CHICKEN_BROTH].boilInto).toBe(XSTATE.BROTH_VAPOR);
    // Пары топлива не наследуют детонацию от FUEL_VAPOR.
    expect(MATERIAL_BY_ID[XSTATE.OIL_VAPOR].detonationShockKPa).toBeUndefined();
    expect(MATERIAL_BY_ID[XSTATE.SOLVENT_VAPOR].detonationShockKPa).toBeUndefined();
  });
});

describe('физика новых веществ', () => {
  it('фитиль впитывает растительное масло капиллярами', () => {
    const w = new World(12, 12); w.applyPreset('home');
    const i = w.idx(5, 5);
    w.setCell(5, 5, XMAT.WICK);
    w.setCell(6, 5, XMAT.VEGETABLE_OIL);
    new ChemistrySolver().step(w);
    expect(w.absorbedMat[i]).toBe(XMAT.VEGETABLE_OIL);
    expect(w.wetness[i]).toBeGreaterThan(100);
  });

  it('сухая вода высвобождает воду при нагреве', () => {
    const w = new World(12, 12); w.applyPreset('home');
    const i = w.idx(5, 5);
    w.setCell(5, 5, XMAT.DRY_WATER, 80);
    const chem = new ChemistrySolver();
    for (let t = 0; t < 60 && w.mat[i] !== MAT.WATER; t++) {
      w.temp[i] = 80;
      chem.step(w);
    }
    expect(w.mat[i]).toBe(MAT.WATER);
  });

  it('сода и уксус дают углекислый газ', () => {
    const w = new World(12, 12); w.applyPreset('home');
    w.setCell(5, 5, XMAT.BAKING_SODA);
    w.setCell(6, 5, XMAT.VINEGAR);
    new ChemistrySolver().step(w);
    expect(w.mat[w.idx(5, 5)]).toBe(MAT.CO2);
  });

  it('новые ВВ детонируют от ударной волны', () => {
    const w = new World(24, 24); w.applyPreset('home');
    w.setCell(12, 12, XMAT.HMX);
    w.airPressure[w.airIdxFromCell(12, 12)] = 120;
    new ChemistrySolver().step(w);
    expect(w.events.explosionEnergy).toBeGreaterThan(0);
  });

  it('пьезоэлемент вырабатывает напряжение от механической нагрузки', () => {
    const w = new World(16, 16); w.applyPreset('home');
    const i = w.idx(8, 8);
    w.setCell(8, 8, XMAT.PIEZO);
    w.stress[i] = 20;
    new ElectricSolver(w.size).step(w, 5);
    expect(w.volt[i]).toBeGreaterThan(3);
  });
});

describe('новые инструменты и исправления физики', () => {
  const engine = () => new SimulationEngine({ resolutionPreset: 'standard' } as GameSettings);
  const stroke = (e: SimulationEngine, x: number, y: number, id: number, r = 3) =>
    e.applyBrushStroke(x, y, x, y, id, r, 'circle', false, false);

  it('магнит притягивает железные опилки, пылесос убирает дым', () => {
    const e = engine(), w = e.world;
    for (let y = 8; y <= 14; y++) for (let x = 8; x <= 14; x++) w.setCell(x, y, MAT.SMOKE);
    const before = Array.from(w.mat).filter(m => m === MAT.SMOKE).length;
    stroke(e, 11, 11, XMAT.TOOL_VACUUM, 6);
    const after = Array.from(w.mat).filter(m => m === MAT.SMOKE).length;
    expect(after).toBeLessThan(before);

    w.clear();
    w.setCell(16, 10, MAT.IRON_FILINGS);
    const target = w.idx(16, 10);
    stroke(e, 10, 10, XMAT.TOOL_MAGNET, 6);
    expect(Math.abs(w.vx[target])).toBeGreaterThan(0);
  });

  it('молот нагружает твёрдое тело, сушилка убирает влагу', () => {
    const e = engine(), w = e.world;
    const i = w.idx(10, 10);
    w.setCell(10, 10, MAT.GLASS);
    for (let k = 0; k < 6; k++) stroke(e, 10, 10, XMAT.TOOL_HAMMER, 2);
    // Хрупкое стекло либо накапливает напряжение, либо уже раскалывается в осколки.
    expect(w.stress[i] > 0 || w.mat[i] === MAT.GLASS_SHARDS).toBe(true);

    w.setCell(20, 10, MAT.SPONGE);
    const j = w.idx(20, 10);
    w.wetness[j] = 200; w.absorbedMat[j] = MAT.WATER;
    stroke(e, 20, 10, XMAT.TOOL_DRYER, 2);
    expect(w.wetness[j]).toBeLessThan(200);
  });

  it('вода растекается по горизонтали заметно быстрее одной клетки за такт', () => {
    const w = new World(64, 28); w.applyPreset('home');
    for (let x = 0; x < w.width; x++) w.setCell(x, 24, MAT.STEEL);
    for (let y = 20; y <= 23; y++) for (let x = 28; x <= 33; x++) w.setCell(x, y, MAT.WATER);
    const mech = new MechanicsSolver(w.size);
    for (let t = 0; t < 70; t++) mech.step(w, false);
    let minX = w.width, maxX = -1;
    for (let y = 0; y < w.height; y++) for (let x = 0; x < w.width; x++) {
      if (w.mat[y * w.width + x] === MAT.WATER) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); }
    }
    expect(maxX - minX).toBeGreaterThan(9);
  });

  it('вода при атмосферном давлении кипит постепенно, а не за несколько тактов', () => {
    const w = new World(30, 20); w.applyPreset('home');
    let total = 0;
    for (let y = 4; y < 16; y++) for (let x = 4; x < 26; x++) { w.setCell(x, y, MAT.WATER, 105); total++; }
    const thermal = new ThermalSolver(w.size);
    for (let t = 0; t < 30; t++) thermal.step(w, true);
    let steam = 0;
    for (let i = 0; i < w.size; i++) if (w.mat[i] === MAT.STEAM) steam++;
    expect(steam).toBeLessThan(total * 0.5);
  });
});
