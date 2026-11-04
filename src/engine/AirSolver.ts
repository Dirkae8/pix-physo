import { MAT, MATERIAL_BY_ID, STATE_LUT } from '../materials/registry';
import { World } from './World';

export class AirSolver {
  private nextP: Float32Array;
  private nextVx: Float32Array;
  private nextVy: Float32Array;

  constructor(airSize: number) {
    this.nextP = new Float32Array(airSize);
    this.nextVx = new Float32Array(airSize);
    this.nextVy = new Float32Array(airSize);
  }

  public ensureSize(airSize: number): void {
    if (this.nextP.length !== airSize) {
      this.nextP = new Float32Array(airSize);
      this.nextVx = new Float32Array(airSize);
      this.nextVy = new Float32Array(airSize);
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

    for (let ay = 0; ay < ah; ay++) {
      const cy0 = ay << 2;
      for (let ax = 0; ax < aw; ax++) {
        const cx0 = ax << 2;
        const ai = ay * aw + ax;
        let solidCount = 0;
        let tempSum = 0;
        let fanHere = false;
        let fanDir = 0;
        let fanBoost = 1.0;

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
                  fanBoost = 2.25;
                }
              } else {
                solidCount++;
              }
            }
          }
        }

        const isBlocked = !fanHere && solidCount >= 10 ? 1 : 0;
        wall[ai] = isBlocked;

        if (isBlocked) {
          vx[ai] = 0;
          vy[ai] = 0;
          p[ai] *= 0.94;
          continue;
        }

        // Thermal convection: hot air expands & rises against gravity
        const avgCellTemp = tempSum * 0.0625;
        const dT = avgCellTemp - ambT;
        if (Math.abs(dT) > 4) {
          vy[ai] -= gravSign * Math.max(-1.8, Math.min(3.2, dT * 0.0022));
          if (dT > 120) {
            p[ai] += Math.min(4.5, dT * 0.0018);
          }
        }

        // Active Fan / Turbine propulsion: creates directional jet + suction behind!
        if (fanHere) {
          fanCount++;
          const jetSpeed = 16.5 * fanBoost;
          const dirX = fanDir === 0 ? 1 : fanDir === 2 ? -1 : 0;
          const dirY = fanDir === 1 ? 1 : fanDir === 3 ? -1 : 0;
          vx[ai] = vx[ai] * 0.4 + dirX * jetSpeed * 0.6;
          vy[ai] = vy[ai] * 0.4 + dirY * jetSpeed * 0.6;

          const frontX = ax + dirX;
          const frontY = ay + dirY;
          if (frontX >= 0 && frontX < aw && frontY >= 0 && frontY < ah) {
            const fi = frontY * aw + frontX;
            if (!wall[fi]) {
              p[fi] += 4.2 * fanBoost;
              vx[fi] += dirX * 4.5 * fanBoost;
              vy[fi] += dirY * 4.5 * fanBoost;
            }
          }
          const backX = ax - dirX;
          const backY = ay - dirY;
          if (backX >= 0 && backX < aw && backY >= 0 && backY < ah) {
            const bi = backY * aw + backX;
            if (!wall[bi]) {
              p[bi] -= 3.2 * fanBoost;
              vx[bi] += dirX * 2.5 * fanBoost;
              vy[bi] += dirY * 2.5 * fanBoost;
            }
          }
        }
      }
    }
    world.events.fanActiveCount = fanCount;

    // 2. Ambient Wind Vector forcing (0..360 deg + optional atmospheric gusts)
    const windSpd = world.env.windSpeed;
    const rad = (world.env.windAngleDeg * Math.PI) / 180;
    const gustFactor = world.env.windGusts
      ? 1.0 + 0.28 * Math.sin(world.timeSec * 2.1) + 0.14 * Math.cos(world.timeSec * 5.3)
      : 1.0;
    const targetWx = Math.cos(rad) * windSpd * gustFactor;
    const targetWy = Math.sin(rad) * windSpd * gustFactor;
    const hasWind = windSpd > 0.02;

    // 3. Coupled Acoustic Wave + Navier-Stokes Pressure-Velocity Relaxation (TPT-inspired)
    for (let iter = 0; iter < iterations; iter++) {
      // Update Pressure from Velocity Divergence: dP/dt = -c^2 * div(u)
      for (let ay = 0; ay < ah; ay++) {
        const row = ay * aw;
        for (let ax = 0; ax < aw; ax++) {
          const i = row + ax;
          if (wall[i]) {
            this.nextP[i] = 0;
            continue;
          }

          const vxR = ax + 1 < aw && !wall[i + 1] ? vx[i + 1] : 0;
          const vxL = ax > 0 && !wall[i - 1] ? vx[i - 1] : 0;
          const vyD = ay + 1 < ah && !wall[i + aw] ? vy[i + aw] : 0;
          const vyU = ay > 0 && !wall[i - aw] ? vy[i - aw] : 0;

          const div = (vxR - vxL + vyD - vyU) * 0.36;

          // Neighbor smoothing for stable shockwave fronts
          const pL = ax > 0 && !wall[i - 1] ? p[i - 1] : p[i];
          const pR = ax + 1 < aw && !wall[i + 1] ? p[i + 1] : p[i];
          const pU = ay > 0 && !wall[i - aw] ? p[i - aw] : p[i];
          const pD = ay + 1 < ah && !wall[i + aw] ? p[i + aw] : p[i];
          const avgP = (pL + pR + pU + pD) * 0.25;

          let np = (p[i] * 0.72 + avgP * 0.28 - div * 2.4) * 0.992;

          // Open boundaries bleed excess pressure to atmosphere
          if (
            (world.env.boundary === 'open_all' && (ax === 0 || ax === aw - 1 || ay === 0 || ay === ah - 1)) ||
            (world.env.boundary === 'open_sky' && ay === 0)
          ) {
            np *= 0.35;
          }

          this.nextP[i] = Math.max(-95, Math.min(1800, np));
        }
      }
      p.set(this.nextP);

      // Update Velocity from Pressure Gradient: du/dt = -grad(P)/rho + viscosity + wind
      for (let ay = 0; ay < ah; ay++) {
        const row = ay * aw;
        for (let ax = 0; ax < aw; ax++) {
          const i = row + ax;
          if (wall[i]) {
            this.nextVx[i] = 0;
            this.nextVy[i] = 0;
            continue;
          }

          const pC = p[i];
          const pR = ax + 1 < aw && !wall[i + 1] ? p[i + 1] : pC;
          const pL = ax > 0 && !wall[i - 1] ? p[i - 1] : pC;
          const pD = ay + 1 < ah && !wall[i + aw] ? p[i + aw] : pC;
          const pU = ay > 0 && !wall[i - aw] ? p[i - aw] : pC;

          let nvx = vx[i] - (pR - pL) * 0.22;
          let nvy = vy[i] - (pD - pU) * 0.22;

          // Viscous diffusion
          const vxAvg =
            ((ax > 0 ? vx[i - 1] : nvx) +
              (ax + 1 < aw ? vx[i + 1] : nvx) +
              (ay > 0 ? vx[i - aw] : nvx) +
              (ay + 1 < ah ? vx[i + aw] : nvx)) *
            0.25;
          const vyAvg =
            ((ax > 0 ? vy[i - 1] : nvy) +
              (ax + 1 < aw ? vy[i + 1] : nvy) +
              (ay > 0 ? vy[i - aw] : nvy) +
              (ay + 1 < ah ? vy[i + aw] : nvy)) *
            0.25;

          nvx = (nvx * 0.84 + vxAvg * 0.16) * 0.985;
          nvy = (nvy * 0.84 + vyAvg * 0.16) * 0.985;

          if (hasWind) {
            const isEdge = ax <= 1 || ax >= aw - 2 || ay <= 1;
            const blend = isEdge ? 0.18 : 0.022;
            nvx += (targetWx - nvx) * blend;
            nvy += (targetWy - nvy) * blend;
          }

          this.nextVx[i] = Math.max(-55, Math.min(55, nvx));
          this.nextVy[i] = Math.max(-55, Math.min(55, nvy));
        }
      }
      vx.set(this.nextVx);
      vy.set(this.nextVy);
    }

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
            const def = MATERIAL_BY_ID[m];
            world.stress[ci] = Math.max(world.stress[ci], maxNeighborP);
            if (maxNeighborP > def.tensileStrength) {
              world.fractureCell(ci, gradX, gradY, Math.hypot(gradX, gradY) || 1, maxNeighborP * 0.012);
            }
          }
        }
      }
    }
  }
}
