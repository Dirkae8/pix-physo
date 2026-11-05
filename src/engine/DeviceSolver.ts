import { MAT, STATE_LUT } from '../materials/registry';
import { World } from './World';

/** Discrete one-cell actuators. Direction is encoded in the low two meta bits. */
export class DeviceSolver {
  public step(world: World): void {
    const {width: w, height: h, mat} = world;
    for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
      const i = y * w + x, type = mat[i];
      if (type === MAT.GAS_CYLINDER) {
        const charge = world.meta[i]&127, opened = (world.meta[i]&128) !== 0;
        if (opened && charge > 0 && world.rand() < .15) {
          for (const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1]]) {
            const nx=x+dx, ny=y+dy, j=ny*w+nx;
            if (world.inBounds(nx,ny) && mat[j] === MAT.EMPTY) {
              world.setCell(nx,ny,MAT.CO2, world.temp[i] - 2);
              world.meta[i] = 128 | (charge-1);
              world.airPressure[world.airIdxFromCell(nx,ny)] += .1;
              break;
            }
          }
        }
        continue;
      }
      if (type === MAT.ELECTROMAGNET && world.volt[i] > 3) {
        for (let dy=-6; dy<=6; dy++) for (let dx=-6; dx<=6; dx++) {
          const dist2 = dx*dx+dy*dy;
          if (dist2 < 1 || dist2 > 36 || !world.inBounds(x+dx,y+dy)) continue;
          const j = (y+dy)*w+x+dx;
          if (mat[j] === MAT.IRON_FILINGS) {
            const pull = Math.min(.7, 2 / dist2) * Math.min(1, world.volt[i] / 24);
            world.vx[j] -= dx * pull; world.vy[j] -= dy * pull;
          }
        }
        continue;
      }
      if ((type === MAT.COMPRESSOR || type === MAT.VACUUM_PUMP) && world.volt[i] > 3) {
        const dir = world.meta[i]&3, dx = dir === 0 ? 1 : dir === 2 ? -1 : 0, dy = dir === 1 ? 1 : dir === 3 ? -1 : 0;
        if (!world.inBounds(x-dx*4,y-dy*4) || !world.inBounds(x+dx*4,y+dy*4)) continue;
        const input = world.airIdxFromCell(x-dx*4,y-dy*4), output = world.airIdxFromCell(x+dx*4,y+dy*4);
        if (input === output || world.airWall[input] || world.airWall[output]) continue;
        const amount = Math.max(0, Math.min(.2 * Math.min(1, world.volt[i]/24), world.env.pressureKPa + world.airPressure[input] - .25));
        world.airPressure[input] -= amount; world.airPressure[output] += amount;
        continue;
      }
      if (type !== MAT.PUMP && type !== MAT.VALVE) continue;
      if (type === MAT.PUMP && world.volt[i] <= 3) continue;
      const direction = world.meta[i] & 3;
      const dx = direction === 0 ? 1 : direction === 2 ? -1 : 0;
      const dy = direction === 1 ? 1 : direction === 3 ? -1 : 0;
      const source = (y - dy) * w + x - dx, target = (y + dy) * w + x + dx;
      if (STATE_LUT[mat[source]] !== 3) continue;
      if (type === MAT.VALVE) {
        const sourceAir = world.airPressure[world.airIdxFromCell(x-dx,y-dy)] + world.stress[source];
        const targetAir = world.airPressure[world.airIdxFromCell(x+dx,y+dy)] + world.stress[target];
        if (sourceAir <= targetAir + .1) continue;
      }
      // Push a contiguous straight column of the same liquid to the first open cell.
      // This preserves every cell and cannot tunnel through a wall or another liquid.
      let vacancy = target, distance = 1;
      while (mat[vacancy] === mat[source] && distance < 32) {
        distance++;
        const tx=x+dx*distance, ty=y+dy*distance;
        if (!world.inBounds(tx,ty)) { vacancy=-1; break; }
        vacancy=ty*w+tx;
      }
      if (vacancy < 0 || (mat[vacancy] !== MAT.EMPTY && STATE_LUT[mat[vacancy]] !== 4)) continue;
      while (distance > 1) {
        const previous=(y+dy*(distance-1))*w+x+dx*(distance-1);
        world.swapCells(previous,vacancy); vacancy=previous; distance--;
      }
      world.swapCells(source,target);
    }
  }
}
