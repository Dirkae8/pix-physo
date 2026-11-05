import { describe, expect, it } from 'vitest';
import { World } from '../src/engine/World';
import { MAT } from '../src/materials/registry';
import { makeWheel, makeSpring, stepMechanicalSystem } from '../src/engine/MechanicalSystem';

describe('pinned mechanical system', () => {
  it('motor requires electricity and meshes gears in opposite directions with radius ratio', () => {
    const w=new World(80,60), motor=makeWheel('motor',20,20,8), gear=makeWheel('gear',40,20,12);
    w.wheels=[motor,gear];
    for(let i=0;i<20;i++) stepMechanicalSystem(w);
    expect(motor.omega).toBe(0); expect(gear.omega).toBe(0);
    w.setCell(20,20,MAT.BATTERY); w.volt[w.idx(20,20)]=24;
    for(let i=0;i<30;i++) stepMechanicalSystem(w);
    expect(motor.omega).toBeGreaterThan(.01); expect(gear.omega).toBeLessThan(-.01);
    expect(motor.omega*motor.radius + gear.omega*gear.radius).toBeCloseTo(0,6);
  });
  it('turbine transfers momentum from moving liquid', () => {
    const w=new World(60,60), turbine=makeWheel('turbine',20,20,10); w.wheels=[turbine];
    w.setCell(30,20,MAT.WATER); w.vy[w.idx(30,20)]=1;
    stepMechanicalSystem(w);
    expect(turbine.omega).toBeGreaterThan(0); expect(w.vy[w.idx(30,20)]).toBeLessThan(1);
  });
  it('powered crushing wheel stresses and fractures fragile solids', () => {
    const w=new World(60,60), wheel=makeWheel('crusher',20,20,10); wheel.omega=1; w.wheels=[wheel];
    w.setCell(30,20,MAT.GLASS); w.rand=()=>0; stepMechanicalSystem(w);
    expect(w.mat[w.idx(30,20)]).toBe(MAT.GLASS_SHARDS);
  });
  it('spring mass responds to gravity and relaxes when gravity is removed', () => {
    const w=new World(60,60), spring=makeSpring(20,10,20,20); w.mechanicalSprings=[spring];
    for(let i=0;i<40;i++) stepMechanicalSystem(w);
    expect(spring.y).toBeGreaterThan(21); expect(spring.restLength).toBe(10);
    w.env.gravity=0; for(let i=0;i<400;i++) stepMechanicalSystem(w);
    expect(Math.hypot(spring.x-spring.ax,spring.y-spring.ay)).toBeCloseTo(10,0);
  });
  it('mechanisms participate in undo and are cleared with a world', () => {
    const w=new World(60,60); w.wheels.push(makeWheel('gear',20,20,8)); w.mechanicalSprings.push(makeSpring(10,10,10,20));
    w.clear(); expect(w.wheels).toHaveLength(0); expect(w.mechanicalSprings).toHaveLength(0);
    w.popUndo(); expect(w.wheels).toHaveLength(1); expect(w.mechanicalSprings).toHaveLength(1);
  });
});

describe('pressure-driven liquid flow', () => {
  it('moves connected liquid from a high-pressure surface toward a low-pressure surface', async () => {
    const { MechanicsSolver } = await import('../src/engine/MechanicsSolver');
    const w=new World(32,22); w.applyPreset('home');
    for(let y=10;y<=15;y++) for(let x=4;x<=27;x++) w.setCell(x,y,MAT.WATER);
    w.airPressure[w.airIdxFromCell(4,9)]=30;
    const before=Array.from(w.mat).filter(m=>m===MAT.WATER).length;
    (new MechanicsSolver(w.size) as any).solveCommunicatingVessels(w);
    expect(Array.from(w.mat).filter(m=>m===MAT.WATER).length).toBe(before);
    expect(w.mat[w.idx(4,10)]).toBe(MAT.EMPTY);
    expect(Array.from(w.mat.slice(9*w.width,10*w.width)).filter(m=>m===MAT.WATER).length).toBe(1);
  });
});

describe('temperature and wind coupling', () => {
  it('water has a density maximum near 4 °C and expands when heated', async () => {
    const { densityAt } = await import('../src/materials/registry');
    expect(densityAt(MAT.WATER,4)).toBeGreaterThan(densityAt(MAT.WATER,20));
    expect(densityAt(MAT.WATER,20)).toBeGreaterThan(densityAt(MAT.WATER,80));
    const w=new World(20,20); w.setCell(10,10,MAT.WATER,80);
    expect(w.probeAt(10,10).density).toBeCloseTo(densityAt(MAT.WATER,80),3);
  });
  it('wind shear gives surface water momentum, calm air does not', async () => {
    const { MechanicsSolver } = await import('../src/engine/MechanicsSolver');
    const run = (wind:number) => {
      const w=new World(20,20); w.applyPreset('home'); w.setCell(10,10,MAT.WATER);
      w.setCell(9,10,MAT.STEEL); w.setCell(11,10,MAT.STEEL); w.setCell(10,11,MAT.STEEL);
      w.airVx[w.airIdxFromCell(10,9)]=wind;
      (new MechanicsSolver(w.size) as any).stepLiquid(w,10,10,w.idx(10,10),MAT.WATER,1,true,1);
      return w.vx[w.idx(10,10)];
    };
    expect(run(0)).toBe(0); expect(run(20)).toBeGreaterThan(0);
  });
});

it('pump pushes a filled straight pipe without destroying liquid or crossing a wall', async () => {
  const { DeviceSolver } = await import('../src/engine/DeviceSolver');
  const w=new World(32,20), device=new DeviceSolver(); w.setCell(10,10,MAT.PUMP); w.volt[w.idx(10,10)]=24;
  w.setCell(9,10,MAT.WATER); for(let x=11;x<=15;x++) w.setCell(x,10,MAT.WATER);
  device.step(w); expect(w.mat[w.idx(16,10)]).toBe(MAT.WATER); expect(w.mat[w.idx(9,10)]).toBe(MAT.EMPTY);
  expect(Array.from(w.mat).filter(m=>m===MAT.WATER)).toHaveLength(6);
  w.setCell(9,10,MAT.WATER); w.setCell(17,10,MAT.STEEL); device.step(w);
  expect(w.mat[w.idx(9,10)]).toBe(MAT.WATER); expect(w.mat[w.idx(17,10)]).toBe(MAT.STEEL);
});

it('flexible cable points do not pass through a wall under moderate wind', async () => {
  const { makeWire, stepWires } = await import('../src/engine/Wires');
  const w=new World(40,40); for(let y=0;y<40;y++) w.setCell(20,y,MAT.STEEL);
  w.airVx.fill(16); const wire=makeWire(8,8,8,28,0); w.wires.push(wire);
  for(let n=0;n<160;n++) stepWires(w);
  expect(wire.points.every(p => p.x < 19.5)).toBe(true);
});

it('mechanical demo powers its drivetrain through a switch', async () => {
  const { DEMO_SCENES } = await import('../src/engine/Demos');
  const { ElectricSolver } = await import('../src/engine/ElectricSolver');
  const w=new World(480,270); DEMO_SCENES.find(d=>d.id==='mechanical_drive')!.build(w);
  const electric=new ElectricSolver(w.size);
  for(let n=0;n<30;n++) { electric.step(w); stepMechanicalSystem(w); }
  expect(w.wheels[0].omega).toBeGreaterThan(.01); expect(w.wheels[1].omega).toBeLessThan(-.01);
  for(let i=0;i<w.size;i++) if(w.mat[i]===MAT.SWITCH) w.meta[i]=0;
  for(let n=0;n<20;n++) electric.step(w);
  const motor=w.wheels[0]; expect(w.volt[w.idx(motor.x,motor.y)]).toBeLessThan(1);
});

describe('return paths and short-circuit heating', () => {
  it('heats a connected short, but not an open circuit', async () => {
    const { CurrentSolver } = await import('../src/engine/CurrentSolver');
    const make=(connected:boolean) => {
      const w=new World(20,20); w.rand=()=>.9; w.setCell(5,10,MAT.BATTERY); w.setCell(6,10,MAT.COPPER_WIRE); w.setCell(7,10,MAT.COPPER_WIRE);
      if(connected) w.setCell(8,10,MAT.GROUND); else w.setCell(10,10,MAT.GROUND);
      return w;
    };
    const closed=make(true), open=make(false), solver=new CurrentSolver();
    for(let n=0;n<15;n++) { solver.step(closed); solver.step(open); }
    expect(closed.temp[closed.idx(6,10)]).toBeGreaterThan(25);
    expect(open.temp[open.idx(6,10)]).toBe(18);
    expect(closed.current[closed.idx(6,10)]).toBeGreaterThan(1);
  });
  it('respects a reversed diode and opens an overheated fuse', async () => {
    const { CurrentSolver } = await import('../src/engine/CurrentSolver');
    const { ElectricSolver } = await import('../src/engine/ElectricSolver');
    const w=new World(20,20); w.applyPreset('home'); w.rand=()=>.9;
    w.setCell(5,10,MAT.BATTERY); w.setCell(6,10,MAT.FUSE); w.setCell(7,10,MAT.DIODE); w.setCell(8,10,MAT.GROUND);
    w.meta[w.idx(7,10)]=2; const current=new CurrentSolver(), electric=new ElectricSolver(w.size);
    for(let n=0;n<5;n++) current.step(w);
    expect(w.temp[w.idx(6,10)]).toBe(22);
    w.meta[w.idx(7,10)]=0;
    for(let n=0;n<150;n++) { electric.step(w); current.step(w); }
    expect(w.meta[w.idx(6,10)]).toBe(0);
  });
});

describe('wind-driven surface mode', () => {
  it('stays still without wind, couples wind waves to the liquid, and preserves its mass', async () => {
    const { SurfaceWaveSolver } = await import('../src/engine/SurfaceWaveSolver');
    const w=new World(60,40); for(let y=24;y<38;y++) for(let x=4;x<56;x++) w.setCell(x,y,MAT.WATER);
    const solver=new SurfaceWaveSolver(), mass=w.mat.filter(m=>m===MAT.WATER).length;
    for(let n=0;n<120;n++) { w.timeSec+=1/60; solver.step(w); }
    expect(Math.max(...w.waveHeight.map(Math.abs))).toBe(0);
    w.airVx.fill(25);
    for(let n=0;n<120;n++) { w.timeSec+=1/60; solver.step(w); }
    expect(Math.max(...w.waveHeight.map(Math.abs))).toBeGreaterThan(.1);
    expect(w.vy.some(v=>Math.abs(v)>.01)).toBe(true);
    expect(w.mat.filter(m=>m===MAT.WATER)).toHaveLength(mass);
  });
});
