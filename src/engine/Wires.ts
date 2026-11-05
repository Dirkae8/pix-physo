import { ELEC_COND_LUT, MAT, STATE_LUT } from '../materials/registry';
import type { World } from './World';

export interface WirePoint { x: number; y: number; oldX: number; oldY: number }
export interface HangingWire { ax: number; ay: number; bx: number; by: number; tension: number; points: WirePoint[] }

export function makeWire(ax: number, ay: number, bx: number, by: number, tension: number): HangingWire {
  const count = Math.max(8, Math.min(40, Math.ceil(Math.hypot(bx - ax, by - ay) / 5)));
  const points = Array.from({length: count + 1}, (_, n) => {
    const t = n / count, x = ax + (bx - ax) * t, y = ay + (by - ay) * t;
    return {x, y, oldX: x, oldY: y};
  });
  return {ax, ay, bx, by, tension: Math.max(0, Math.min(1, tension)), points};
}

// Verlet integration with fixed endpoints and distance constraints. Wires are separate
// from the cellular material grid: they are insulated and couple only at their ends.
export function stepWires(world: World): void {
  for (const wire of world.wires) {
    const p = wire.points, last = p.length - 1;
    if (last < 2) continue;
    const oldPositions = p.map(point => ({x: point.x, y: point.y}));
    const segment = Math.hypot(wire.bx - wire.ax, wire.by - wire.ay) * (1.34 - .335 * wire.tension) / last;
    p[0].x = wire.ax; p[0].y = wire.ay;
    p[last].x = wire.bx; p[last].y = wire.by;
    for (let n = 1; n < last; n++) {
      const q = p[n], ox = q.x, oy = q.y;
      const x = Math.max(0, Math.min(world.width - 1, Math.round(q.x)));
      const y = Math.max(0, Math.min(world.height - 1, Math.round(q.y)));
      const ai = world.airIdxFromCell(x, y);
      q.x += (q.x - q.oldX) * .975 + world.airVx[ai] * .002;
      q.y += (q.y - q.oldY) * .975 + world.env.gravity * .003 + world.airVy[ai] * .002;
      q.oldX = ox; q.oldY = oy;
    }
    for (let pass = 0; pass < 10; pass++) {
      for (let n = 0; n < last; n++) {
        const a = p[n], b = p[n + 1], dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 1, error = (d - segment) / d;
        const aWeight = n === 0 ? 0 : n + 1 === last ? 1 : .5;
        const bWeight = n + 1 === last ? 0 : n === 0 ? 1 : .5;
        a.x += dx * error * aWeight; a.y += dy * error * aWeight;
        b.x -= dx * error * bWeight; b.y -= dy * error * bWeight;
      }
      // Resolve intermediate point collisions against rigid cells and world bounds.
      // This is a point-based approximation rather than a full thick-rope contact solver.
      for (let n=1; n<last; n++) {
        const q=p[n]; q.x=Math.max(0,Math.min(world.width-1,q.x)); q.y=Math.max(0,Math.min(world.height-1,q.y));
        const x=Math.round(q.x), y=Math.round(q.y);
        if (STATE_LUT[world.mat[world.idx(x,y)]] !== 1) continue;
        const before=oldPositions[n], bx=Math.max(0,Math.min(world.width-1,Math.round(before.x))), by=Math.max(0,Math.min(world.height-1,Math.round(before.y)));
        if (STATE_LUT[world.mat[world.idx(bx,by)]] !== 1) { q.x=before.x; q.y=before.y; q.oldX=q.x; q.oldY=q.y; }
      }
    }
  }
}

export function wireConnections(world: World): Map<number, number[]> {
  const connections = new Map<number, number[]>();
  const connect = (a: number, b: number) => { const v = connections.get(a) || []; v.push(b); connections.set(a, v); };
  for (const wire of world.wires) {
    if (!world.inBounds(wire.ax, wire.ay) || !world.inBounds(wire.bx, wire.by)) continue;
    const a = wire.ay * world.width + wire.ax, b = wire.by * world.width + wire.bx;
    if (a === b || world.mat[a] === MAT.EMPTY || world.mat[b] === MAT.EMPTY || ELEC_COND_LUT[world.mat[a]] <= 0 || ELEC_COND_LUT[world.mat[b]] <= 0) continue;
    connect(a, b); connect(b, a);
  }
  return connections;
}
