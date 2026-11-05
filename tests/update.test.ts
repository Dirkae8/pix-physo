import { describe, expect, it } from 'vitest';
import { World } from '../src/engine/World';
import { ElectricSolver } from '../src/engine/ElectricSolver';
import { makeWire, stepWires } from '../src/engine/Wires';
import { MAT } from '../src/materials/registry';

describe('flexible electrical cables', () => {
  it('sags under gravity and is less slack with greater tension', () => {
    const w = new World(80, 60); w.env.windSpeed = 0;
    const loose = makeWire(10, 10, 70, 10, 0), tight = makeWire(10, 10, 70, 10, 1);
    w.wires = [loose, tight];
    for (let i = 0; i < 240; i++) stepWires(w);
    expect(loose.points[0].y).toBe(10);
    expect(loose.points.at(-1)!.y).toBe(10);
    expect(loose.points[Math.floor(loose.points.length / 2)].y).toBeGreaterThan(12);
    expect(loose.points[Math.floor(loose.points.length / 2)].y).toBeGreaterThan(tight.points[Math.floor(tight.points.length / 2)].y);
  });
  it('conducts between endpoints and disconnects when a terminal is removed', () => {
    const w = new World(80, 60), solver = new ElectricSolver(w.size);
    w.setCell(10, 10, MAT.BATTERY); w.setCell(60, 10, MAT.LAMP);
    w.wires.push(makeWire(10, 10, 60, 10, .5));
    solver.step(w); expect(w.volt[w.idx(60, 10)]).toBeGreaterThan(5);
    w.setCell(10, 10, MAT.EMPTY);
    for (let i = 0; i < 15; i++) solver.step(w);
    expect(w.volt[w.idx(60, 10)]).toBeLessThan(1);
  });
});

describe('weather', () => {
  it('makes rain or snow from ambient temperature only with open boundaries', async () => {
    const { SimulationEngine } = await import('../src/engine/SimulationEngine');
    const engine = new SimulationEngine({resolutionPreset: 'standard'} as any), w = engine.world;
    w.rand = () => .5; w.env.precipitation = true; w.env.storm = false; w.env.boundary = 'open_sky';
    w.env.ambientTempC = -5; (engine as any).stepWeather(); expect(w.mat[240]).toBe(MAT.SNOW);
    w.setCell(240, 0, MAT.EMPTY); w.env.ambientTempC = 5; (engine as any).stepWeather(); expect(w.mat[240]).toBe(MAT.WATER);
    w.setCell(240, 0, MAT.EMPTY); w.env.boundary = 'closed'; (engine as any).stepWeather(); expect(w.mat[240]).toBe(MAT.EMPTY);
  });
});

describe('wind tunnel wiring', () => {
  it('isolates the fan when its switch is turned off', async () => {
    const { DEMO_SCENES } = await import('../src/engine/Demos');
    const w = new World(480, 270), solver = new ElectricSolver(w.size);
    DEMO_SCENES.find(scene => scene.id === 'wind_tunnel_circuit')!.build(w);
    for (let n=0; n<5; n++) solver.step(w);
    const fans = Array.from(w.mat, (m, i) => m === MAT.FAN ? i : -1).filter(i => i >= 0);
    expect(Math.max(...fans.map(i => w.volt[i]))).toBeGreaterThan(5);
    for (let i=0; i<w.size; i++) if (w.mat[i] === MAT.SWITCH) w.meta[i] = 0;
    for (let n=0; n<18; n++) solver.step(w);
    expect(Math.max(...fans.map(i => w.volt[i]))).toBeLessThan(1);
  });
});
