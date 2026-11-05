import { describe, expect, it } from 'vitest';
import { MAT, MATERIAL_BY_ID } from '../src/materials/registry';
import { World } from '../src/engine/World';
import { AirSolver } from '../src/engine/AirSolver';
import { ChemistrySolver } from '../src/engine/ChemistrySolver';
import { ThermalSolver } from '../src/engine/ThermalSolver';
import { MechanicsSolver } from '../src/engine/MechanicsSolver';

describe('combustion, heat, and impermeable airflow', () => {
  it('keeps steel nonflammable and heat diffusion stable', () => {
    const w = new World(64, 32); w.applyPreset('home');
    for (let x = 5; x < 59; x++) w.setCell(x, 16, MAT.STEEL, x === 5 ? 1000 : 20);
    const thermal = new ThermalSolver(w.size), chem = new ChemistrySolver();
    for (let t = 0; t < 60; t++) { thermal.step(w); chem.step(w); }
    for (let x = 5; x < 59; x++) {
      const i = w.idx(x, 16);
      expect(w.mat[i]).toBe(MAT.STEEL);
      expect(w.temp[i]).toBeGreaterThanOrEqual(19);
      expect(w.temp[i]).toBeLessThanOrEqual(1000);
    }
  });
  it('boils ethanol into ethanol vapor which burns without per-particle explosions', () => {
    expect(MATERIAL_BY_ID[MAT.ETHANOL].boilInto).toBe(MAT.ETHANOL_VAPOR);
    expect(MATERIAL_BY_ID[MAT.ETHANOL_VAPOR].freezeInto).toBe(MAT.ETHANOL);
    const w = new World(48, 32); w.applyPreset('home');
    for (let y = 10; y < 18; y++) for (let x = 10; x < 35; x++) w.setCell(x, y, MAT.ETHANOL, 125);
    const thermal = new ThermalSolver(w.size), chem = new ChemistrySolver();
    for (let t = 0; t < 8; t++) { thermal.step(w); chem.step(w); }
    expect(Array.from(w.mat).filter(m => m === MAT.ETHANOL_VAPOR).length).toBeGreaterThan(0);
    for (let y = 10; y < 18; y++) for (let x = 10; x < 35; x++) if (w.mat[w.idx(x,y)] === MAT.ETHANOL_VAPOR) w.temp[w.idx(x,y)] = 600;
    w.setCell(10, 9, MAT.FIRE);
    for (let t = 0; t < 12; t++) chem.step(w);
    expect(w.events.explosionEnergy).toBe(0);
  });
  it('blocks even a one-pixel wall, but allows flow through an open vent', () => {
    const w = new World(96, 64); w.applyPreset('home'); w.env.windSpeed = 0;
    // Wall separates the whole domain; fans on the left push toward it.
    for (let y = 0; y < w.height; y++) w.setCell(48, y, MAT.STEEL);
    for (let y = 20; y < 44; y++) for (let x = 16; x < 24; x++) w.setCell(x, y, MAT.FAN);
    const air = new AirSolver(w.airSize);
    for (let t = 0; t < 30; t++) air.step(w, 2);
    expect(w.airVx[w.airIdxFromCell(28, 28)]).toBeGreaterThan(0.05);
    for (let y = 0; y < w.airH; y++) for (let x = 13; x < w.airW; x++) {
      const i = y * w.airW + x;
      expect(Math.abs(w.airVx[i]) + Math.abs(w.airVy[i]) + Math.abs(w.airPressure[i])).toBeLessThan(0.001);
    }
    for (let y = 24; y < 40; y++) w.setCell(48, y, MAT.EMPTY);
    for (let t = 0; t < 80; t++) air.step(w, 2);
    let rightVelocity = 0;
    for (let y = 0; y < w.airH; y++) for (let x = 13; x < w.airW; x++) rightVelocity = Math.max(rightVelocity, Math.abs(w.airVx[y * w.airW + x]));
    expect(rightVelocity).toBeGreaterThan(0.01);
  });
  it('a directional fan advects flame in its blowing direction', () => {
    const run = (direction: 0 | 2) => {
      const w = new World(96, 64); w.applyPreset('home'); w.env.gravity = 0;
      w.activeFanDir = direction;
      for (let y = 16; y < 48; y++) for (let x = 44; x < 52; x++) w.setCell(x, y, MAT.FAN);
      const start = direction === 0 ? 56 : 39;
      for (let y = 25; y < 39; y++) for (let x = start; x < start + 3; x++) w.setCell(x, y, MAT.FIRE);
      const air = new AirSolver(w.airSize), mechanics = new MechanicsSolver(w.size);
      for (let t = 0; t < 12; t++) { air.step(w, 2); mechanics.step(w, false); }
      let sum = 0, count = 0;
      for (let i = 0; i < w.size; i++) if (w.mat[i] === MAT.FIRE) { sum += i % w.width; count++; }
      return sum / count - (start + 1);
    };
    expect(run(0)).toBeGreaterThan(1);
    expect(run(2)).toBeLessThan(-1);
  });
  it('ambient wind does not appear inside a closed room', () => {
    const w = new World(64, 64); w.applyPreset('home'); w.env.windSpeed = 20;
    const air = new AirSolver(w.airSize);
    for (let t = 0; t < 8; t++) air.step(w, 2);
    expect(Math.max(...w.airVx.map(Math.abs))).toBe(0);
  });
});
