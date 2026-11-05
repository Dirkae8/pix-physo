import { describe, it, expect } from 'vitest';
import { World } from '../src/engine/World';
import { ElectricSolver } from '../src/engine/ElectricSolver';
import { DeviceSolver } from '../src/engine/DeviceSolver';
import { ThermalSolver } from '../src/engine/ThermalSolver';
import { ChemistrySolver } from '../src/engine/ChemistrySolver';
import { MechanicsSolver } from '../src/engine/MechanicsSolver';
import { AirSolver } from '../src/engine/AirSolver';
import { SimulationEngine } from '../src/engine/SimulationEngine';
import { MAT } from '../src/materials/registry';
import type { GameSettings } from '../src/types/physics';

describe('new electrical components', () => {
  it('diode allows forward voltage but blocks reverse voltage', () => {
    for (const reverse of [false,true]) {
      const w = new World(20, 20); w.setCell(reverse ? 12 : 10,10,MAT.BATTERY); w.setCell(11,10,MAT.DIODE); w.setCell(reverse ? 10 : 12,10,MAT.LAMP);
      const s = new ElectricSolver(w.size); for (let n=0;n<10;n++) s.step(w);
      const v = w.volt[w.idx(reverse ? 10 : 12,10)]; if (reverse) expect(v).toBe(0); else expect(v).toBeGreaterThan(5);
    }
  });
  it('capacitor retains charge after the source is removed', () => {
    const w = new World(20,20); w.setCell(10,10,MAT.BATTERY); w.setCell(11,10,MAT.CAPACITOR); w.setCell(12,10,MAT.LAMP);
    const s = new ElectricSolver(w.size); s.step(w); w.setCell(10,10,MAT.EMPTY);
    for (let n=0;n<8;n++) s.step(w);
    expect(w.volt[w.idx(12,10)]).toBeGreaterThan(5);
  });
  it('fuse opens once hot; temperature and pressure switches respond to thresholds', () => {
    const w = new World(30,20), s = new ElectricSolver(w.size);
    w.setCell(5,5,MAT.BATTERY); w.setCell(6,5,MAT.FUSE); w.setCell(7,5,MAT.LAMP);
    w.temp[w.idx(6,5)] = 200; s.step(w); expect(w.volt[w.idx(7,5)]).toBe(0);
    w.setCell(12,5,MAT.THERMOSTAT,70); w.setCell(15,5,MAT.PRESSURE_SWITCH); w.env.pressureKPa = 125; s.step(w);
    expect(w.meta[w.idx(12,5)]).toBe(1); expect(w.meta[w.idx(15,5)]).toBe(1);
    w.temp[w.idx(12,5)] = 20; w.env.pressureKPa = 100; s.step(w);
    expect(w.meta[w.idx(12,5)]).toBe(0); expect(w.meta[w.idx(15,5)]).toBe(0);
  });
  it('unpowered fans do not inject a jet', () => {
    const w = new World(48,32); w.applyPreset('home'); w.setCell(12,12,MAT.FAN);
    const air = new AirSolver(w.airSize); for (let n=0;n<5;n++) air.step(w,2);
    expect(Math.max(...w.airVx.map(Math.abs))).toBe(0);
  });
});

describe('liquids and reactions', () => {
  it('powered pump moves a liquid in the selected direction', () => {
    const w = new World(20,20), d = new DeviceSolver(); w.setCell(10,10,MAT.PUMP); w.setCell(9,10,MAT.WATER); d.step(w);
    expect(w.mat[w.idx(9,10)]).toBe(MAT.WATER); w.volt[w.idx(10,10)] = 24; d.step(w);
    expect(w.mat[w.idx(11,10)]).toBe(MAT.WATER); expect(w.mat[w.idx(9,10)]).toBe(MAT.EMPTY);
  });
  it('valve permits only forward pressure-driven flow', () => {
    const w = new World(20,20), d = new DeviceSolver(); w.setCell(10,10,MAT.VALVE); w.setCell(9,10,MAT.WATER); w.stress[w.idx(9,10)] = 1; d.step(w);
    expect(w.mat[w.idx(11,10)]).toBe(MAT.WATER);
    d.step(w); expect(w.mat[w.idx(11,10)]).toBe(MAT.WATER);
  });
  it('gas bubbles rise through heavier liquid', () => {
    const w = new World(20,20); w.applyPreset('home'); w.rand = () => 0; w.setCell(10,10,MAT.OXYGEN); w.setCell(10,9,MAT.WATER);
    const m = new MechanicsSolver(w.size); m.step(w,false); expect(w.mat[w.idx(10,9)]).toBe(MAT.OXYGEN);
  });
  it('acid neutralizes alkali into salt water', () => {
    const w = new World(20,20); w.setCell(10,10,MAT.ACID); w.setCell(11,10,MAT.ALKALI); new ChemistrySolver().step(w);
    expect(w.mat[w.idx(10,10)]).toBe(MAT.SALTWATER); expect(w.mat[w.idx(11,10)]).toBe(MAT.SALTWATER);
  });
  it('dry ice sublimates and vapor condenses on cold glass', () => {
    const w = new World(20,20); w.applyPreset('home'); w.env.humidity = 90; w.rand=()=>0;
    w.setCell(10,10,MAT.DRY_ICE,0); w.setCell(13,10,MAT.WATER_VAPOR,5); w.setCell(14,10,MAT.GLASS,0);
    new ThermalSolver(w.size).step(w);
    expect(w.mat[w.idx(10,10)]).toBe(MAT.CO2); expect([MAT.WATER,MAT.FROST]).toContain(w.mat[w.idx(13,10)]);
  });
  it('different metals retain identity when melted and frozen', () => {
    for (const [metal,melt] of [[MAT.GOLD,MAT.MOLTEN_GOLD],[MAT.ALUMINUM,MAT.MOLTEN_ALUMINUM],[MAT.LEAD,MAT.MOLTEN_LEAD]] as const) {
      const w = new World(20,20), t = new ThermalSolver(w.size); w.rand=()=>0; w.setCell(10,10,metal,2000); t.step(w);
      expect(w.mat[w.idx(10,10)]).toBe(melt); w.temp[w.idx(10,10)] = 20; t.step(w); expect(w.mat[w.idx(10,10)]).toBe(metal);
    }
  });
  it('fire extinguisher suppresses flame', () => {
    const e = new SimulationEngine({resolutionPreset:'standard'} as GameSettings); e.world.setCell(10,10,MAT.FIRE,600);
    e.applyBrushStroke(10,10,10,10,MAT.TOOL_EXTINGUISHER,1,'circle',false,false);
    expect(e.world.mat[e.world.idx(10,10)]).toBe(MAT.CO2);
  });
});

describe('actuators', () => {
  it('relay switches its axial circuit from an isolated side signal', () => {
    const w = new World(20,20), e = new ElectricSolver(w.size);
    w.setCell(9,10,MAT.BATTERY); w.setCell(10,10,MAT.RELAY); w.setCell(11,10,MAT.LAMP);
    for (let n=0;n<4;n++) e.step(w); expect(w.volt[w.idx(11,10)]).toBe(0);
    w.setCell(10,9,MAT.BATTERY);
    for (let n=0;n<4;n++) e.step(w); expect(w.volt[w.idx(11,10)]).toBeGreaterThan(5);
    w.setCell(10,9,MAT.EMPTY);
    for (let n=0;n<20;n++) e.step(w); expect(w.volt[w.idx(11,10)]).toBeLessThan(1);
  });
  it('electromagnet pulls iron, compressor transfers pressure only when powered', () => {
    const w = new World(40,30), d = new DeviceSolver(); w.applyPreset('home');
    w.setCell(12,12,MAT.ELECTROMAGNET); w.setCell(15,12,MAT.IRON_FILINGS); w.volt[w.idx(12,12)] = 24; d.step(w);
    expect(w.vx[w.idx(15,12)]).toBeLessThan(0);
    w.setCell(24,12,MAT.COMPRESSOR); const input=w.airIdxFromCell(20,12), output=w.airIdxFromCell(28,12);
    d.step(w); expect(w.airPressure[input]).toBe(0); w.volt[w.idx(24,12)]=24; d.step(w);
    expect(w.airPressure[input]).toBeLessThan(0); expect(w.airPressure[output]).toBeGreaterThan(0);
  });
});

describe('gas cylinder', () => {
  it('stores CO2 until its valve is opened and conserves its charge', () => {
    const w = new World(20,20); w.rand=()=>0; const d = new DeviceSolver(); w.setCell(10,10,MAT.GAS_CYLINDER);
    d.step(w); expect(w.meta[w.idx(10,10)]).toBe(127); expect(w.mat[w.idx(10,9)]).toBe(MAT.EMPTY);
    expect(w.interactClickAt(10,10)).toBe(true); d.step(w);
    expect(w.mat[w.idx(10,9)]).toBe(MAT.CO2); expect(w.meta[w.idx(10,10)] & 127).toBe(126);
    w.interactClickAt(10,10); expect(w.meta[w.idx(10,10)] & 128).toBe(0);
  });
});

describe('oxygen consumption', () => {
  it('a sealed fire consumes its oxygen and then goes out', () => {
    const w = new World(4,4); w.applyPreset('home');
    for (let y=0;y<4;y++) for (let x=0;x<4;x++) w.setCell(x,y,MAT.FIRE,900);
    const air = new AirSolver(w.airSize), chem = new ChemistrySolver();
    for (let n=0;n<30;n++) { air.step(w,2); chem.step(w); }
    expect(w.airOxygen[0]).toBeLessThan(.015);
    expect(Array.from(w.mat).filter(m => m === MAT.FIRE)).toHaveLength(0);
  });
  it('open air replenishes oxygen at its boundary', () => {
    const w = new World(4,4); w.env.boundary='open_sky'; w.airOxygen[0]=0;
    const air = new AirSolver(w.airSize); for (let n=0;n<10;n++) air.step(w,2);
    expect(w.airOxygen[0]).toBeGreaterThan(.05);
  });
});

describe('phase details', () => {
  it('salt water can crystallize salt when exposed to dry air', () => {
    const w = new World(20,20); w.env.humidity = 0; w.rand=()=>0;
    w.setCell(10,10,MAT.SALTWATER,30); new ThermalSolver(w.size).step(w);
    expect(w.mat[w.idx(10,10)]).toBe(MAT.SALT); expect(w.mat[w.idx(10,9)]).toBe(MAT.WATER_VAPOR);
  });
  it('moist steel can oxidize to rust', () => {
    const w = new World(20,20); w.env.humidity=100; let draws = 0; w.rand=()=> draws++ % 2 === 0 ? .525 : 0;
    w.setCell(10,10,MAT.STEEL); w.setCell(11,10,MAT.WATER); new ChemistrySolver().step(w);
    expect(w.mat[w.idx(10,10)]).toBe(MAT.RUST);
  });
  it('transfers radiative heat to a solid at a distance', () => {
    const w = new World(20,20); w.applyPreset('home'); w.stepTick=8;
    w.setCell(5,10,MAT.STEEL,1200); w.setCell(10,10,MAT.STEEL,20);
    const a = new World(20,20); a.applyPreset('home'); a.stepTick=1;
    a.setCell(5,10,MAT.STEEL,1200); a.setCell(10,10,MAT.STEEL,20);
    new ThermalSolver(w.size).step(w); new ThermalSolver(a.size).step(a);
    expect(w.temp[w.idx(10,10)]).toBeGreaterThan(a.temp[a.idx(10,10)]);
  });
});
