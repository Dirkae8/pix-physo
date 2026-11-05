import { MAT, STATE_LUT, TENSILE_LUT } from '../materials/registry';
import type { World } from './World';

export type WheelKind = 'gear' | 'motor' | 'turbine' | 'crusher';
/** A pinned circular rigid body, coupled to other wheels by a no-slip tooth constraint. */
export interface Wheel { kind: WheelKind; x: number; y: number; radius: number; angle: number; omega: number }
/** A point mass on an anchored, damped Hooke spring. */
export interface MechanicalSpring { ax: number; ay: number; x: number; y: number; vx: number; vy: number; restLength: number; stiffness: number; damping: number }

export function makeWheel(kind: WheelKind, x: number, y: number, radius: number): Wheel {
  return {kind, x: Math.round(x), y: Math.round(y), radius: Math.max(4, Math.min(32, Math.round(radius))), angle: 0, omega: 0};
}
export function makeSpring(ax: number, ay: number, x: number, y: number): MechanicalSpring {
  return {ax, ay, x, y, vx: 0, vy: 0, restLength: Math.max(4, Math.hypot(x-ax,y-ay)), stiffness: .012, damping: .035};
}

const inertia = (wheel: Wheel) => Math.max(.5, wheel.radius * wheel.radius * .02);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max,v));

export function stepMechanicalSystem(world: World): void {
  const wheels = world.wheels;
  // Electric motors use the voltage at their shaft. Turbines exchange angular
  // momentum with nearby moving liquid, rather than creating rotation from still water.
  for (const wheel of wheels) {
    if (!world.inBounds(wheel.x,wheel.y)) continue;
    const i = world.idx(wheel.x,wheel.y), I = inertia(wheel);
    if (wheel.kind === 'motor') {
      const power = clamp(world.volt[i] / 24, 0, 1);
      const torque = power * .18 * clamp(1 - wheel.omega / 1.0, -1, 1);
      wheel.omega += torque / I;
      if (power > 0 && world.mat[i] !== MAT.EMPTY) world.temp[i] += Math.abs(torque * wheel.omega) * .02;
    }
    if (wheel.kind === 'turbine' || wheel.kind === 'crusher') {
      const samples = Math.max(12, Math.ceil(wheel.radius * 2));
      for (let n=0; n<samples; n++) {
        const a = n * 2 * Math.PI / samples + wheel.angle, nx = Math.cos(a), ny = Math.sin(a);
        const x = Math.round(wheel.x + nx*wheel.radius), y = Math.round(wheel.y + ny*wheel.radius);
        if (!world.inBounds(x,y)) continue;
        const j=world.idx(x,y), state=STATE_LUT[world.mat[j]];
        const tangentX=-ny, tangentY=nx;
        if (wheel.kind === 'turbine' && state === 3) {
          const relative = world.vx[j]*tangentX + world.vy[j]*tangentY - wheel.omega*wheel.radius;
          // Equal and opposite tangential impulse; particle mass is an approximate unit mass.
          const impulse = clamp(relative * .035, -.35, .35);
          wheel.omega += impulse * wheel.radius / I;
          world.vx[j] -= impulse*tangentX; world.vy[j] -= impulse*tangentY;
        } else if (wheel.kind === 'crusher' && Math.abs(wheel.omega) > .03) {
          if (state === 2 || state === 3) {
            const impulse = clamp(wheel.omega*wheel.radius*.12,-2,2);
            world.vx[j] += tangentX*impulse; world.vy[j] += tangentY*impulse;
            wheel.omega -= impulse*wheel.radius/I*.02;
          } else if (state === 1 && Math.abs(wheel.omega)*wheel.radius > 2 && world.rand() < .025) {
            const force = Math.abs(wheel.omega)*wheel.radius*30;
            world.stress[j] = Math.max(world.stress[j], force);
            if (force > Math.max(20,TENSILE_LUT[world.mat[j]])) world.fractureCell(j,nx,ny,1,force*.01);
          }
        }
      }
    }
    wheel.omega = clamp(wheel.omega * .995, -2, 2);
  }
  // Sequential impulse enforces vA + vB = 0 at meshing teeth, including inertia.
  for (let pass=0; pass<5; pass++) for (let a=0; a<wheels.length; a++) for (let b=a+1; b<wheels.length; b++) {
    const A=wheels[a], B=wheels[b], separation=Math.hypot(B.x-A.x,B.y-A.y);
    if (Math.abs(separation - A.radius - B.radius) > 1.5) continue;
    const ra=A.radius, rb=B.radius, ia=inertia(A), ib=inertia(B);
    const impulse = -(ra*A.omega + rb*B.omega)/(ra*ra/ia + rb*rb/ib);
    A.omega += impulse*ra/ia; B.omega += impulse*rb/ib;
  }
  for (const wheel of wheels) wheel.angle = (wheel.angle + wheel.omega) % (2*Math.PI);

  // Explicit damped spring with four small substeps for stability.
  for (const s of world.mechanicalSprings) {
    for (let sub=0; sub<4; sub++) {
      const dx=s.x-s.ax, dy=s.y-s.ay, length=Math.max(.001, Math.hypot(dx,dy));
      const radial=(s.vx*dx+s.vy*dy)/length;
      const force=-s.stiffness*(length-s.restLength)-s.damping*radial;
      s.vx += force*dx/length*.25;
      s.vy += (force*dy/length + world.env.gravity*.003)*.25;
      const oldX=s.x, oldY=s.y;
      s.x=clamp(s.x+s.vx*.25, 0, world.width-1); s.y=clamp(s.y+s.vy*.25, 0, world.height-1);
      const px=Math.round(s.x), py=Math.round(s.y), j=world.idx(px,py), state=STATE_LUT[world.mat[j]];
      if (state===1 && Math.hypot(s.x-s.ax,s.y-s.ay)>2) { s.x=oldX; s.y=oldY; s.vx*=-.2; s.vy*=-.2; }
      else if (state===2 || state===3) { world.vx[j]+=s.vx*.04; world.vy[j]+=s.vy*.04; s.vx*=.995; s.vy*=.995; }
      if (s.x===0 || s.x===world.width-1) s.vx*=-.2;
      if (s.y===0 || s.y===world.height-1) s.vy*=-.2;
    }
  }
}
