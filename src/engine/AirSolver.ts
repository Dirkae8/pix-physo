import { MAT, STATE_LUT, TENSILE_LUT } from '../materials/registry';
import { World } from './World';

export class AirSolver {
  private nextP: Float32Array;
  private nextVx: Float32Array;
  private nextVy: Float32Array;
  private nextOxygen: Float32Array;
  private fanDirs: Uint8Array;
  private fanBoosts: Float32Array;
  private fanCellBuf: Int32Array;

  constructor(airSize: number) {
    this.nextP = new Float32Array(airSize);
    this.nextVx = new Float32Array(airSize);
    this.nextVy = new Float32Array(airSize);
    this.nextOxygen = new Float32Array(airSize);
    this.fanDirs = new Uint8Array(airSize);
    this.fanBoosts = new Float32Array(airSize);
    this.fanCellBuf = new Int32Array(airSize);
  }

  public ensureSize(airSize: number): void {
    if (this.nextP.length !== airSize) {
      this.nextP = new Float32Array(airSize);
      this.nextVx = new Float32Array(airSize);
      this.nextVy = new Float32Array(airSize);
      this.nextOxygen = new Float32Array(airSize);
      this.fanDirs = new Uint8Array(airSize);
      this.fanBoosts = new Float32Array(airSize);
      this.fanCellBuf = new Int32Array(airSize);
    }
  }

  public step(world: World, iterations = 2): void {
    this.ensureSize(world.airSize);

    const aw = world.airW;
    const ah = world.airH;
    const w = world.width;
    const h = world.height;
    const mat = world.mat;
    const temp = world.temp;
    const volt = world.volt;
    const meta = world.meta;
    const wall = world.airWall;
    const p = world.airPressure;
    const vx = world.airVx;
    const vy = world.airVy;

    // 1. Build solid obstacle mask, thermal buoyancy & Fan aerodynamic jets
    const ambT = world.env.ambientTempC;
    const gravSign = Math.sign(world.env.gravity) || 1;
    let fanCount = 0;
    let fanLen = 0;
    let activity = 0;
    let peakPressure = 0;
    const fanCells = this.fanCellBuf;
    this.fanDirs.fill(0);

    for (let ay = 0; ay < ah; ay++) {
      const cy0 = ay << 2;
      const yEnd = Math.min(h, cy0 + 4);
      for (let ax = 0; ax < aw; ax++) {
        const cx0 = ax << 2;
        const ai = ay * aw + ax;

        // Блок 4×4 целиком вне вещества: маска уже пуста, 16 чтений не нужны.
        let blockMin = w, blockMax = -1;
        for (let y = cy0; y < yEnd; y++) {
          if (!world.rowActive[y]) continue;
          if (world.rowMinX[y] < blockMin) blockMin = world.rowMinX[y];
          if (world.rowMaxX[y] > blockMax) blockMax = world.rowMaxX[y];
        }
        if (blockMax < cx0 || blockMin > cx0 + 3 || blockMax < 0) {
          wall[ai] = 0;
          const a = Math.abs(p[ai]);
          if (a > activity) activity = a;
          if (a > peakPressure) peakPressure = a;
          if (Math.abs(vx[ai]) > activity) activity = Math.abs(vx[ai]);
          if (Math.abs(vy[ai]) > activity) activity = Math.abs(vy[ai]);
          continue;
        }

        let solidCount = 0;
        let tempSum = 0;
        let fanHere = false;
        let fanDir = 0;
        let fanBoost = 0;

        for (let dy = 0; dy < 4; dy++) {
          const y = cy0 + dy;
          if (y >= h) continue;
          const row = y * w;
          for (let dx = 0; dx < 4; dx++) {
            const x = cx0 + dx;
            if (x >= w) continue;
            const ci = row + x;
            const m = mat[ci];
            tempSum += temp[ci];
            if (STATE_LUT[m] === 1) {
              if (m === MAT.FAN) {
                fanHere = true;
                fanDir = meta[ci] & 3;
                if (Math.abs(volt[ci]) > 3) {
                  const setting = meta[ci] >>> 2;
                  fanBoost = Math.max(fanBoost, 2.25 * (setting ? setting / 63 : 1) * Math.min(1, Math.abs(volt[ci]) / 24));
                }
              } else {
                solidCount++;
              }
            }
          }
        }

        // A single solid pixel can form a sealed wall. Conservatively rasterize it
        // into the coarse air grid instead of letting thin walls disappear.
        const isBlocked = !fanHere && solidCount > 0 ? 1 : 0;
        wall[ai] = isBlocked;

        if (isBlocked) {
          vx[ai] = 0;
          vy[ai] = 0;
          p[ai] *= 0.94;
          continue;
        }

        const ap = Math.abs(p[ai]), avx = Math.abs(vx[ai]), avy = Math.abs(vy[ai]);
        if (ap > activity) activity = ap;
        if (avx > activity) activity = avx;
        if (avy > activity) activity = avy;
        if (ap > peakPressure) peakPressure = ap;

        // Thermal convection: hot air expands & rises against gravity
        const avgCellTemp = tempSum * 0.0625;
        const dT = avgCellTemp - ambT;
        if (Math.abs(dT) > 4) {
          vy[ai] -= gravSign * Math.max(-1.8, Math.min(3.2, dT * 0.0022));
          if (dT > 120) {
            p[ai] += Math.min(4.5, dT * 0.0018);
          }
        }

        if (fanHere && fanBoost > 0) {
          this.fanDirs[ai] = fanDir + 1;
          this.fanBoosts[ai] = fanBoost;
          fanCells[fanLen++] = ai;
          fanCount++;
        }
      }
    }
    world.events.fanActiveCount = fanCount;

    // Впрыск вентиляторов только по реально найденным ячейкам, а не полным
    // проходом по всей coarse-сетке (раньше это был лишний O(aw*ah)).
    for (let k = 0; k < fanLen; k++) {
      const ai = fanCells[k], dir = this.fanDirs[ai] - 1;
      if (dir < 0 || wall[ai]) continue;
      const ax = ai % aw, ay = (ai / aw) | 0;
      const dx = dir === 0 ? 1 : dir === 2 ? -1 : 0;
      const dy = dir === 1 ? 1 : dir === 3 ? -1 : 0;
      const boost = this.fanBoosts[ai];
      const fx = ax + dx, fy = ay + dy, bx = ax - dx, by = ay - dy;
      const frontOpen = fx >= 0 && fx < aw && fy >= 0 && fy < ah && !wall[fy * aw + fx];
      if (!frontOpen) continue;
      vx[ai] = vx[ai] * .4 + dx * 16.5 * boost * .6;
      vy[ai] = vy[ai] * .4 + dy * 16.5 * boost * .6;
      const fi = fy * aw + fx;
      p[fi] += 4.2 * boost; vx[fi] += dx * 4.5 * boost; vy[fi] += dy * 4.5 * boost;
      if (bx >= 0 && bx < aw && by >= 0 && by < ah && !wall[by * aw + bx]) {
        const bi = by * aw + bx;
        p[bi] -= 3.2 * boost; vx[bi] += dx * 2.5 * boost; vy[bi] += dy * 2.5 * boost;
      }
    }


    // 2. Ambient Wind Vector forcing (0..360 deg + optional atmospheric gusts)
    const windSpd = world.env.windSpeed;
    const rad = (world.env.windAngleDeg * Math.PI) / 180;
    const gustFactor = world.env.windGusts
      ? 1.0 + 0.28 * Math.sin(world.timeSec * 2.1) + 0.14 * Math.cos(world.timeSec * 5.3)
      : 1.0;
    const targetWx = Math.cos(rad) * windSpd * gustFactor;
    const targetWy = Math.sin(rad) * windSpd * gustFactor;
    const hasWind = windSpd > 0.02;

    // 3. Coupled Acoustic Wave + Navier-Stokes Pressure-Velocity Relaxation.
    // Спокойный воздух (нет ветра, вентиляторов, давления и течений) вообще
    // не нуждается в релаксации: экономим два полных прохода по coarse-сетке.
    // Буферы меняются местами (ping-pong) вместо p.set()/vx.set() на каждой
    // итерации — при iterations=2 это убирает 6 копий массивов за такт.
    const needsRelax = hasWind || fanCount > 0 || activity > 0.02;
    if (needsRelax) {
      let curP: Float32Array = p, curVx: Float32Array = vx, curVy: Float32Array = vy;
      let nxtP: Float32Array = this.nextP, nxtVx: Float32Array = this.nextVx, nxtVy: Float32Array = this.nextVy;
      let tmp: Float32Array;

      // Ветер сам по себе не требует двух итераций: они нужны только для
      // вентиляторов и ударных волн. На спокойных сценах экономим проход.
      const relaxIters = (fanCount > 0 || peakPressure > 5) ? iterations : 1;
      for (let iter = 0; iter < relaxIters; iter++) {
        // Update Pressure from Velocity Divergence: dP/dt = -c^2 * div(u)
        for (let ay = 0; ay < ah; ay++) {
          const row = ay * aw;
          for (let ax = 0; ax < aw; ax++) {
            const i = row + ax;
            if (wall[i]) { nxtP[i] = 0; continue; }

            const vxR = ax + 1 < aw && !wall[i + 1] ? curVx[i + 1] : 0;
            const vxL = ax > 0 && !wall[i - 1] ? curVx[i - 1] : 0;
            const vyD = ay + 1 < ah && !wall[i + aw] ? curVy[i + aw] : 0;
            const vyU = ay > 0 && !wall[i - aw] ? curVy[i - aw] : 0;
            const div = (vxR - vxL + vyD - vyU) * 0.36;

            const pL = ax > 0 && !wall[i - 1] ? curP[i - 1] : curP[i];
            const pR = ax + 1 < aw && !wall[i + 1] ? curP[i + 1] : curP[i];
            const pU = ay > 0 && !wall[i - aw] ? curP[i - aw] : curP[i];
            const pD = ay + 1 < ah && !wall[i + aw] ? curP[i + aw] : curP[i];
            const avgP = (pL + pR + pU + pD) * 0.25;

            let np = (curP[i] * 0.72 + avgP * 0.28 - div * 2.4) * 0.992;
            if (
              (world.env.boundary === 'open_all' && (ax === 0 || ax === aw - 1 || ay === 0 || ay === ah - 1)) ||
              (world.env.boundary === 'open_sky' && ay === 0)
            ) np *= 0.35;
            nxtP[i] = Math.max(-95, Math.min(1800, np));
          }
        }
        tmp = curP; curP = nxtP; nxtP = tmp;

        // Update Velocity from Pressure Gradient: du/dt = -grad(P)/rho + viscosity + wind
        for (let ay = 0; ay < ah; ay++) {
          const row = ay * aw;
          for (let ax = 0; ax < aw; ax++) {
            const i = row + ax;
            if (wall[i]) { nxtVx[i] = 0; nxtVy[i] = 0; continue; }

            const pC = curP[i];
            const pR = ax + 1 < aw && !wall[i + 1] ? curP[i + 1] : pC;
            const pL = ax > 0 && !wall[i - 1] ? curP[i - 1] : pC;
            const pD = ay + 1 < ah && !wall[i + aw] ? curP[i + aw] : pC;
            const pU = ay > 0 && !wall[i - aw] ? curP[i - aw] : pC;

            let nvx = curVx[i] - (pR - pL) * 0.22;
            let nvy = curVy[i] - (pD - pU) * 0.22;

            const vxAvg = ((ax > 0 ? curVx[i - 1] : nvx) + (ax + 1 < aw ? curVx[i + 1] : nvx) +
              (ay > 0 ? curVx[i - aw] : nvx) + (ay + 1 < ah ? curVx[i + aw] : nvx)) * 0.25;
            const vyAvg = ((ax > 0 ? curVy[i - 1] : nvy) + (ax + 1 < aw ? curVy[i + 1] : nvy) +
              (ay > 0 ? curVy[i - aw] : nvy) + (ay + 1 < ah ? curVy[i + aw] : nvy)) * 0.25;

            nvx = (nvx * 0.84 + vxAvg * 0.16) * 0.985;
            nvy = (nvy * 0.84 + vyAvg * 0.16) * 0.985;

            const openEdge = world.env.boundary === 'open_all'
              ? ax === 0 || ax === aw - 1 || ay === 0 || ay === ah - 1
              : world.env.boundary === 'open_sky' && ay === 0;
            if (hasWind && openEdge) { nvx += (targetWx - nvx) * 0.18; nvy += (targetWy - nvy) * 0.18; }
            if ((nvx > 0 && ax + 1 < aw && wall[i + 1]) || (nvx < 0 && ax > 0 && wall[i - 1])) nvx = 0;
            if ((nvy > 0 && ay + 1 < ah && wall[i + aw]) || (nvy < 0 && ay > 0 && wall[i - aw])) nvy = 0;

            nxtVx[i] = Math.max(-55, Math.min(55, nvx));
            nxtVy[i] = Math.max(-55, Math.min(55, nvy));
          }
        }
        tmp = curVx; curVx = nxtVx; nxtVx = tmp;
        tmp = curVy; curVy = nxtVy; nxtVy = tmp;
      }
      if (curP !== p) p.set(curP);
      if (curVx !== vx) vx.set(curVx);
      if (curVy !== vy) vy.set(curVy);
    }

    // Oxygen diffuses and is advected through open air cells, not through walls.
    // Кислород может меняться и в неподвижном воздухе (его съедает огонь),
    // поэтому этот один дешёвый проход оставляем всегда.
    const oxygen = world.airOxygen;
    for (let ay=0; ay<ah; ay++) for (let ax=0; ax<aw; ax++) {
      const i=ay*aw+ax, center=oxygen[i];
      if (wall[i]) { this.nextOxygen[i]=center; continue; }
      const left=ax>0 && !wall[i-1] ? oxygen[i-1] : center;
      const right=ax+1<aw && !wall[i+1] ? oxygen[i+1] : center;
      const up=ay>0 && !wall[i-aw] ? oxygen[i-aw] : center;
      const down=ay+1<ah && !wall[i+aw] ? oxygen[i+aw] : center;
      const advX = Math.min(.18,Math.abs(vx[i])*.004) * ((vx[i] >= 0 ? left : right)-center);
      const advY = Math.min(.18,Math.abs(vy[i])*.004) * ((vy[i] >= 0 ? up : down)-center);
      let next = center + .025*(left+right+up+down-4*center) + advX + advY;
      const edge = world.env.boundary === 'open_all' ? ax===0||ay===0||ax===aw-1||ay===ah-1 : world.env.boundary === 'open_sky' && ay===0;
      if (edge) next += (.21-next)*.08;
      this.nextOxygen[i]=Math.max(0,Math.min(.21,next));
    }
    oxygen.set(this.nextOxygen);

    // 4. Destructive Shockwaves: High air pressure gradient shatters fragile walls (Glass, Ice, Wood, Brick)!
    for (let ay = 1; ay < ah - 1; ay++) {
      for (let ax = 1; ax < aw - 1; ax++) {
        const ai = ay * aw + ax;
        if (!wall[ai]) continue;

        // Measure max neighboring overpressure pushing against this solid block
        const maxNeighborP = Math.max(
          Math.abs(p[ai - 1]),
          Math.abs(p[ai + 1]),
          Math.abs(p[ai - aw]),
          Math.abs(p[ai + aw])
        );
        if (maxNeighborP < 34) continue;

        const gradX = p[ai - 1] - p[ai + 1];
        const gradY = p[ai - aw] - p[ai + aw];
        // Геометрия удара одинакова для всех 16 пикселей ячейки: считаем один раз.
        const gradLen = Math.sqrt(gradX * gradX + gradY * gradY) || 1;
        const cx0 = ax << 2;
        const cy0 = ay << 2;

        for (let dy = 0; dy < 4; dy++) {
          const y = cy0 + dy;
          if (y >= h) continue;
          for (let dx = 0; dx < 4; dx++) {
            const x = cx0 + dx;
            if (x >= w) continue;
            const ci = y * w + x;
            const m = mat[ci];
            if (STATE_LUT[m] !== 1 || m === MAT.FAN) continue;
            world.stress[ci] = Math.max(world.stress[ci], maxNeighborP);
            if (maxNeighborP > TENSILE_LUT[m]) {
              world.fractureCell(ci, gradX, gradY, gradLen, maxNeighborP * 0.012);
            }
          }
        }
      }
    }
  }
}
