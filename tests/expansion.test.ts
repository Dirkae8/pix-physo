import { describe, expect, it } from 'vitest';
import { MAT, MAX_MAT_ID, MATERIAL_BY_ID, SELECTABLE_MATERIALS } from '../src/materials/registry';
import { World } from '../src/engine/World';
import { SimulationEngine } from '../src/engine/SimulationEngine';
import type { GameSettings } from '../src/types/physics';

describe('expanded palette and tools', () => {
  it('has exactly 15 selectable items in every category and unique in-range IDs', () => {
    expect(SELECTABLE_MATERIALS).toHaveLength(105);
    for (const c of ['solids', 'powders', 'liquids', 'gases', 'electric', 'explosives', 'tools']) {
      expect(SELECTABLE_MATERIALS.filter(m => m.category === c)).toHaveLength(15);
    }
    expect(new Set(SELECTABLE_MATERIALS.map(m => m.id)).size).toBe(105);
    for (const m of SELECTABLE_MATERIALS) {
      expect(m.id).toBeLessThan(MAX_MAT_ID);
      expect(MATERIAL_BY_ID[m.id]).toBe(m);
    }
  });
  it('samples the exact pinned position and clears pins with the world', () => {
    const w = new World(20, 20);
    w.setCell(4, 7, MAT.WATER, 42);
    w.sensors.push({ id: 1, x: 4, y: 7 });
    expect(w.probeAt(w.sensors[0].x, w.sensors[0].y).tempC).toBe(42);
    expect(w.probeAt(4, 7).matId).toBe(MAT.WATER);
    w.clear(); expect(w.sensors).toHaveLength(0);
  });
  it('new laser, cryo and shock tools act on the simulation', () => {
    const engine = new SimulationEngine({ resolutionPreset: 'standard' } as GameSettings);
    const w = engine.world;
    w.setCell(10, 10, MAT.STEEL, 20);
    const apply = (m: number) => engine.applyBrushStroke(10, 10, 10, 10, m, 1, 'circle', false, false);
    apply(MAT.TOOL_LASER); expect(w.temp[w.idx(10, 10)]).toBeGreaterThan(20);
    const hot = w.temp[w.idx(10, 10)]; apply(MAT.TOOL_CRYO); expect(w.temp[w.idx(10, 10)]).toBeLessThan(hot);
    apply(MAT.TOOL_SHOCK); expect(w.airPressure[w.airIdxFromCell(10, 10)]).toBeGreaterThan(0);
  });
});
