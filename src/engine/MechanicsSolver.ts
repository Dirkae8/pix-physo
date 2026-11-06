import {
  DENSITY_LUT,
  densityAt,
  DISPERSION_LUT,
  MAT,
  MATERIAL_BY_ID,
  STATE_LUT,
  TENSILE_LUT,
  VISCOSITY_LUT,
} from '../materials/registry';
import { World } from './World';

export class MechanicsSolver {
  // Метки поколений вместо vis.fill(0): большой мир больше не чистит весь массив
  // на каждом подшаге, при этом логика BFS остаётся прежней.
  private visited: Uint16Array;
  private visitGen = 0;
  private bfsQueue: Int32Array;
  private compCells: Int32Array;
  private highSurfBuf: Int32Array;
  private lowAirBuf: Int32Array;

  constructor(size: number) {
    this.visited = new Uint16Array(size);
    this.bfsQueue = new Int32Array(size);
    this.compCells = new Int32Array(size);
    this.highSurfBuf = new Int32Array(size);
    this.lowAirBuf = new Int32Array(size);
  }

  public ensureSize(size: number): void {
    if (this.visited.length !== size) {
      this.visited = new Uint16Array(size);
      this.bfsQueue = new Int32Array(size);
      this.compCells = new Int32Array(size);
      // Буферы поверхностей раньше были фиксированными на 4096 ячеек: в мире
      // 960×540 компонент жидкости может быть больше, и часть переноса терялась.
      this.highSurfBuf = new Int32Array(size);
      this.lowAirBuf = new Int32Array(size);
      this.visitGen = 0;
    }
  }

  public step(world: World, runPascalVessels = true): void {
    this.ensureSize(world.size);

    world.stepTick = (world.stepTick + 1) & 0xffff;
    if (world.stepTick === 0) {
      world.stamp.fill(0);
      world.stepTick = 1;
    }
    const tick = world.stepTick;

    this.updateHandGrab(world);

    // Connected-Component Pascal & Torricelli Communicating-Vessels Solver (once per frame on substep 0)
    // При отрицательной гравитации сообщающиеся сосуды работают зеркально, а не отключаются.
    if (runPascalVessels && Math.abs(world.env.gravity) > 0.5) {
      this.solveCommunicatingVessels(world);
    }

    const w = world.width;
    const h = world.height;
    const mat = world.mat;
    const stamp = world.stamp;
    const grav = world.env.gravity;
    const downDir = grav >= 0 ? 1 : -1;
    const hasGravity = Math.abs(grav) > 0.05;

    const yStart = downDir > 0 ? h - 1 : 0;
    const yEnd = downDir > 0 ? -1 : h;
    const yStep = downDir > 0 ? -1 : 1;

    for (let y = yStart; y !== yEnd; y += yStep) {
      if (!world.rowActive[y]) continue;
      const flipX = ((y + tick) & 1) === 1;
      for (let rawX = 0; rawX < w; rawX++) {
        const x = flipX ? w - 1 - rawX : rawX;
        const i = y * w + x;
        const m = mat[i];
        const st = STATE_LUT[m];
        if ((st !== 2 && st !== 3) || stamp[i] === tick) continue;
        if (st === 2) {
          this.stepPowder(world, x, y, i, m, downDir, hasGravity, tick);
        } else if (st === 3) {
          this.stepLiquid(world, x, y, i, m, downDir, hasGravity, tick);
        }
      }
    }

    for (let y = 0; y < h; y++) {
      if (!world.rowActive[y]) continue;
      const flipX = ((y + tick + 1) & 1) === 1;
      for (let rawX = 0; rawX < w; rawX++) {
        const x = flipX ? w - 1 - rawX : rawX;
        const i = y * w + x;
        const m = mat[i];
        const st = STATE_LUT[m];
        if ((st !== 4 && st !== 5) || stamp[i] === tick) continue;
        if (st === 4 || st === 5) {
          this.stepGasOrEnergy(world, x, y, i, m, tick);
        }
      }
    }

    this.applyBoundaries(world);
  }

  private solveCommunicatingVessels(world: World): void {
    const w = world.width;
    const h = world.height;
    const mat = world.mat;
    const vis = this.visited;
    const queue = this.bfsQueue;
    const comp = this.compCells;
    let gen = ++this.visitGen;
    if (gen >= 65535) {
      vis.fill(0);
      gen = this.visitGen = 1;
    }
    let lowAirPressure=Infinity, highAirPressure=-Infinity;
    for (let ai=0; ai<world.airSize; ai++) if (!world.airWall[ai]) {
      lowAirPressure=Math.min(lowAirPressure,world.airPressure[ai]);
      highAirPressure=Math.max(highAirPressure,world.airPressure[ai]);
    }
    const hasPressureVariation=highAirPressure-lowAirPressure>1;

    for (let startIdx = 0; startIdx < world.size; startIdx++) {
      if (vis[startIdx] === gen) continue;
      const m = mat[startIdx];
      if (STATE_LUT[m] !== 3) {
        if (world.stress[startIdx] !== 0) world.stress[startIdx] *= 0.88;
        continue;
      }

      // BFS across connected body of liquid `m`
      let qHead = 0;
      let qTail = 0;
      let compLen = 0;
      vis[startIdx] = gen;
      queue[qTail++] = startIdx;

      let minSurfLiqY = h;
      let maxFreeAirY = -1;

      while (qHead < qTail) {
        const ci = queue[qHead++];
        comp[compLen++] = ci;
        const cx = ci % w;
        const cy = (ci / w) | 0;

        // Check if this liquid cell has free air/gas directly above it
        if (cy > 0) {
          const aboveIdx = ci - w;
          const am = mat[aboveIdx];
          if (am === MAT.EMPTY || STATE_LUT[am] === 4) {
            if (cy < minSurfLiqY) minSurfLiqY = cy;
            if (cy - 1 > maxFreeAirY) maxFreeAirY = cy - 1;
          }
        }

        // 4-neighbor BFS expansion
        if (cx > 0) {
          const ni = ci - 1;
          if (vis[ni] !== gen && mat[ni] === m) {
            vis[ni] = gen;
            queue[qTail++] = ni;
          }
        }
        if (cx + 1 < w) {
          const ni = ci + 1;
          if (vis[ni] !== gen && mat[ni] === m) {
            vis[ni] = gen;
            queue[qTail++] = ni;
          }
        }
        if (cy > 0) {
          const ni = ci - w;
          if (vis[ni] !== gen && mat[ni] === m) {
            vis[ni] = gen;
            queue[qTail++] = ni;
          }
        }
        if (cy + 1 < h) {
          const ni = ci + w;
          if (vis[ni] !== gen && mat[ni] === m) {
            vis[ni] = gen;
            queue[qTail++] = ni;
          }
        }
      }

      // A pressure difference above connected liquid surfaces drives flow even
      // when both surfaces are at the same height. Transfers remain inside the
      // connected liquid component and never cross a wall.
      let pressureMoved = false;
      if (hasPressureVariation && compLen > 1 && Math.abs(world.env.gravity) > 0.5) {
        const rhoScale = DENSITY_LUT[m] * .0025 * (Math.abs(world.env.gravity) / 9.81);
        const gSign = world.env.gravity >= 0 ? 1 : -1;
        let donor=-1, receiver=-1, high=-Infinity, low=Infinity, maxPressure=-Infinity, minPressure=Infinity;
        for (let k=0; k<compLen; k++) {
          const ci=comp[k], cx=ci%w, cy=(ci/w)|0;
          if (cy<=0 || cy+1>=h || mat[ci+w]!==m) continue;
          const above=mat[ci-w]; if (above!==MAT.EMPTY && STATE_LUT[above]!==4) continue;
          const pressure=world.airPressure[world.airIdxFromCell(cx,cy-1)];
          const head=pressure-rhoScale*cy*gSign;
          if (head>high) { high=head; donor=ci; }
          if (head<low) { low=head; receiver=ci-w; }
          maxPressure=Math.max(maxPressure,pressure); minPressure=Math.min(minPressure,pressure);
        }
        if (maxPressure-minPressure>1 && high-low>Math.max(.5,rhoScale*.5) && donor>=0 && receiver>=0 && donor!==receiver) {
          world.swapCells(donor,receiver);
          pressureMoved = true;
        }
      }

      if (compLen < 16 || maxFreeAirY <= minSurfLiqY + 1) {
        // Still record hydrostatic pressure P = rho * g * depth
        const rhoScale = DENSITY_LUT[m] * 0.0025 * (Math.abs(world.env.gravity) / 9.81);
        for (let k = 0; k < compLen; k++) {
          const ci = comp[k];
          const cy = (ci / w) | 0;
          world.stress[ci] = Math.max(0, (cy - minSurfLiqY) * rhoScale);
        }
        continue;
      }

      // Collect high-elevation liquid donors & low-elevation free-surface air receivers!
      let highCount = 0;
      let lowCount = 0;
      const rhoScale = DENSITY_LUT[m] * 0.0025 * (world.env.gravity / 9.81);

      for (let k = 0; k < compLen; k++) {
        const ci = comp[k];
        const cy = (ci / w) | 0;
        world.stress[ci] = Math.max(0, (cy - minSurfLiqY) * rhoScale);

        if (cy <= 0) continue;
        const aboveIdx = ci - w;
        const am = mat[aboveIdx];
        if (am !== MAT.EMPTY && STATE_LUT[am] !== 4) continue;

        if (cy <= minSurfLiqY + 1 && highCount < this.highSurfBuf.length) {
          this.highSurfBuf[highCount++] = ci;
        }
        if (cy - 1 >= maxFreeAirY - 1 && lowCount < this.lowAirBuf.length) {
          this.lowAirBuf[lowCount++] = aboveIdx;
        }
      }

      if (!pressureMoved && highCount > 0 && lowCount > 0) {
        const headDiff = maxFreeAirY - minSurfLiqY;
        const fluidity = Math.max(0.12, 1 - VISCOSITY_LUT[m]);
        const effectiveWidth = Math.min(highCount, lowCount);
        // Torricelli's Law scaled by channel/vessel width: Q ~ A * sqrt(2 * g * dh)
        const transferQuota = Math.min(
          effectiveWidth,
          Math.max(2, Math.round(effectiveWidth * 0.42 * fluidity * Math.min(2.2, Math.sqrt(headDiff * (Math.abs(world.env.gravity) / 9.81)) * 0.28)))
        );

        // Раньше шаг (t*7)%N при N, кратном 7, всегда выбирал одну и ту же
        // клетку-донор, и вся квота переноса пропадала впустую.
        const offset = world.randByte() % Math.max(1, Math.min(highCount, lowCount));
        for (let t = 0; t < transferQuota; t++) {
          const srcIdx = this.highSurfBuf[(t + offset) % highCount];
          const dstIdx = this.lowAirBuf[(t * 3 + offset) % lowCount];
          if (srcIdx !== dstIdx && mat[srcIdx] === m && (mat[dstIdx] === MAT.EMPTY || STATE_LUT[mat[dstIdx]] === 4)) {
            world.swapCells(srcIdx, dstIdx);
          }
        }
      }
    }
  }

  private canDisplace(moverMat: number, targetMat: number, world: World, moverIdx: number, targetIdx: number): boolean {
    if (targetMat === MAT.EMPTY) return true;
    const ts = STATE_LUT[targetMat];
    if (ts === 1 || ts === 6) return false;
    if (ts === 4 || ts === 5) return true;

    const rhoMover = densityAt(moverMat, world.temp[moverIdx]);
    const rhoTarget = densityAt(targetMat, world.temp[targetIdx]);
    const threshold = moverMat === targetMat && STATE_LUT[moverMat] === 3 ? 1.001 : 1.03;
    if (rhoMover <= rhoTarget * threshold) return false;

    const diffRatio = (rhoMover - rhoTarget) / (rhoMover + 1);
    return world.rand() < Math.min(0.95, 0.25 + diffRatio * 1.2);
  }

  private applyAirCoupling(world: World, x: number, y: number, i: number, density: number): void {
    const ai = world.airIdxFromCell(x, y);
    const avx = world.airVx[ai];
    const avy = world.airVy[ai];
    if (Math.abs(avx) + Math.abs(avy) < 0.35) return;

    const aero = Math.min(0.28, 38 / (density + 120));
    world.vx[i] += (avx * 0.22 - world.vx[i]) * aero;
    world.vy[i] += (avy * 0.22 - world.vy[i]) * aero;
  }

  private stepBallisticVelocity(world: World, x: number, y: number, i: number, tick: number): boolean {
    const vx = world.vx[i];
    const vy = world.vy[i];
    const speedSq = vx * vx + vy * vy;
    if (speedSq < 0.7225) return false;
    const speed = Math.sqrt(speedSq);

    const w = world.width;
    const steps = Math.min(5, Math.max(1, Math.round(speed)));
    const dx = vx / steps;
    const dy = vy / steps;

    let cx = x;
    let cy = y;
    let curIdx = i;

    for (let s = 1; s <= steps; s++) {
      const nx = Math.round(x + dx * s);
      const ny = Math.round(y + dy * s);
      if (!world.inBounds(nx, ny)) {
        world.vx[curIdx] *= -0.35;
        world.vy[curIdx] *= -0.35;
        break;
      }
      if (nx === cx && ny === cy) continue;

      const ni = ny * w + nx;
      const nm = world.mat[ni];
      if (nm === MAT.EMPTY || STATE_LUT[nm] === 4) {
        world.swapCells(curIdx, ni);
        curIdx = ni;
        cx = nx;
        cy = ny;
      } else {
        world.vx[curIdx] *= 0.25;
        world.vy[curIdx] *= 0.25;
        if (STATE_LUT[nm] === 2 || STATE_LUT[nm] === 3) {
          world.vx[ni] += vx * 0.35;
          world.vy[ni] += vy * 0.35;
        }
        break;
      }
    }

    world.vx[curIdx] *= 0.94;
    world.vy[curIdx] = world.vy[curIdx] * 0.94 + (world.env.gravity / 9.81) * 0.18;
    world.stamp[curIdx] = tick;
    return curIdx !== i;
  }

  private stepPowder(
    world: World,
    x: number,
    y: number,
    i: number,
    m: number,
    downDir: number,
    hasGravity: boolean,
    tick: number
  ): void {
    const rho = DENSITY_LUT[m];
    this.applyAirCoupling(world, x, y, i, rho);

    if (this.stepBallisticVelocity(world, x, y, i, tick)) return;
    if (!hasGravity) return;

    const w = world.width;
    const ny = y + downDir;
    if (ny < 0 || ny >= world.height) return;

    const below = ny * w + x;
    const prevY = y - downDir;
    if (
      x > 0 &&
      x + 1 < w &&
      world.mat[below] === m &&
      world.mat[ny * w + x - 1] === m &&
      world.mat[ny * w + x + 1] === m &&
      (prevY < 0 || prevY >= world.height || STATE_LUT[world.mat[prevY * w + x]] !== 3)
    ) {
      return;
    }

    if (this.canDisplace(m, world.mat[below], world, i, below)) {
      world.swapCells(i, below);
      world.vy[below] = Math.min(4.2, world.vy[below] + 0.28 * downDir);
      return;
    }

    if (prevY >= 0 && prevY < world.height) {
      const above = prevY * w + x;
      const aboveMat = world.mat[above];
      if (STATE_LUT[aboveMat] === 3 && DENSITY_LUT[aboveMat] > rho * 1.08 && world.rand() < 0.75) {
        world.swapCells(i, above);
        return;
      }
    }

    const def = MATERIAL_BY_ID[m];
    const wetBonus = world.wetness[i] > 30 && def.porosity > 0 ? 0.56 : 0;
    const reposeHold = Math.min(0.92, def.reposeSkip + wetBonus);
    if (reposeHold > 0 && world.rand() < reposeHold) return;

    const dirFirst = world.rand() < 0.5 ? -1 : 1;
    for (let attempt = 0; attempt < 2; attempt++) {
      const dx = attempt === 0 ? dirFirst : -dirFirst;
      const nx = x + dx;
      if (nx < 0 || nx >= w) continue;
      if (STATE_LUT[world.mat[y * w + nx]] === 1) continue;

      const diagIdx = ny * w + nx;
      if (this.canDisplace(m, world.mat[diagIdx], world, i, diagIdx)) {
        world.swapCells(i, diagIdx);
        return;
      }
    }
  }

  private stepLiquid(
    world: World,
    x: number,
    y: number,
    i: number,
    m: number,
    downDir: number,
    hasGravity: boolean,
    tick: number
  ): void {
    const rho = densityAt(m, world.temp[i]);
    // Wind shear acts on an exposed liquid surface, not on the submerged bulk.
    // Resulting ripples are generated by momentum and gravity, not an independent wave source.
    if (y > 0 && (world.mat[i-world.width] === MAT.EMPTY || STATE_LUT[world.mat[i-world.width]] === 4)) {
      const ai=world.airIdxFromCell(x,y-1), wind=world.airVx[ai];
      if (Math.abs(wind)>1) {
        const impulse=Math.max(-.08,Math.min(.08,(wind*.18-world.vx[i])*.01));
        world.vx[i]+=impulse; world.airVx[ai]-=impulse*.002;
      }
    }

    if (this.stepBallisticVelocity(world, x, y, i, tick)) return;

    const w = world.width;
    const h = world.height;

    let visc = VISCOSITY_LUT[m];
    if (world.temp[i] > 60 && visc > 0.1) {
      visc *= Math.max(0.25, 1 - (world.temp[i] - 60) * 0.002);
    }

    if (!hasGravity) {
      if (world.rand() < 0.08) {
        const nx = x + (world.rand() < 0.5 ? -1 : 1);
        const ny = y + (world.rand() < 0.5 ? -1 : 1);
        if (world.inBounds(nx, ny) && world.mat[ny * w + nx] === MAT.EMPTY) {
          world.swapCells(i, ny * w + nx);
        }
      }
      return;
    }

    const ny = y + downDir;
    const canGoDown = ny >= 0 && ny < h;

    if (canGoDown && world.mat[ny*w+x] === m && Math.abs(world.temp[i] - world.temp[ny*w+x]) > .5) {
      const below=ny*w+x, rhoHere=densityAt(m,world.temp[i]), rhoBelow=densityAt(m,world.temp[below]);
      if (rhoHere > rhoBelow * 1.001 && world.rand() < Math.min(.08,(rhoHere-rhoBelow)/rhoHere*3)) {
        world.swapCells(i,below); return;
      }
    }

    // Fast-path for interior bulk fluid surrounded on all lower/side neighbors by identical liquid!
    if (
      canGoDown &&
      x > 0 &&
      x + 1 < w &&
      world.mat[ny * w + x] === m &&
      world.mat[i - 1] === m &&
      world.mat[i + 1] === m &&
      world.mat[ny * w + x - 1] === m &&
      world.mat[ny * w + x + 1] === m
    ) {
      return;
    }

    let diagonalTried = false;
    if (canGoDown) {
      const below = ny * w + x;
      if (this.canDisplace(m, world.mat[below], world, i, below)) {
        world.swapCells(i, below);
        return;
      }

      if (visc < 0.05 || world.rand() > visc * 0.55) {
        diagonalTried = true;
        const firstDir = world.rand() < 0.5 ? -1 : 1;
        for (let k = 0; k < 2; k++) {
          const dx = k === 0 ? firstDir : -firstDir;
          const nx = x + dx;
          if (nx < 0 || nx >= w) continue;
          const diag = ny * w + nx;
          const diagM = world.mat[diag];
          const sideM = world.mat[y * w + nx];
          // Диагональ через твёрдый бок разрешена только когда под самой
          // жидкостью есть свободный проход (жидкость огибает выступ, а не
          // протискивается сквозь угол из двух сплошных стен) и над боковой
          // клеткой тоже открыто. Так заполняются пустоты у кромок, но стены
          // остаются непроницаемыми.
          if (STATE_LUT[sideM] === 1) {
            if (STATE_LUT[world.mat[ny * w + x]] === 1) continue;
            const aboveSideY = y - downDir;
            if (aboveSideY < 0 || aboveSideY >= h) continue;
            if (STATE_LUT[world.mat[aboveSideY * w + nx]] === 1) continue;
            if (diagM !== MAT.EMPTY && STATE_LUT[diagM] !== 4 && STATE_LUT[diagM] !== 3) continue;
          }
          if (this.canDisplace(m, diagM, world, i, diag)) {
            world.swapCells(i, diag);
            return;
          }
        }
      }
    }

    // Вязкость не должна отключать обе фазы сразу: если диагонали пропущены,
    // горизонтальное растекание обязано отработать.
    if (visc > 0.08 && diagonalTried && world.rand() < visc * 0.65) return;

    // 0 означает «не растекаться» (например у очень густого геля), а не 8.
    const disp = DISPERSION_LUT[m];
    if (disp <= 0) return;
    const dirA = world.rand() < 0.5 ? -1 : 1;
    const upY = y - downDir;

    for (let pass = 0; pass < 2; pass++) {
      const dir = pass === 0 ? dirA : -dirA;
      let farthestClearIdx = -1;

      for (let step = 1; step <= disp; step++) {
        const nx = x + dir * step;
        if (nx < 0 || nx >= w) break;
        const ni = y * w + nx;
        const nm = world.mat[ni];

        if (nm === MAT.EMPTY || STATE_LUT[nm] === 4) {
          farthestClearIdx = ni;
          if (canGoDown && this.canDisplace(m, world.mat[ny * w + nx], world, i, ny * w + nx)) {
            world.swapCells(i, ny * w + nx);
            return;
          }
        } else if (STATE_LUT[nm] === 3 && densityAt(nm,world.temp[ni]) < rho * 0.96) {
          // Тяжёлая жидкость должна всплывать/тонуть ЗА СЧЁТ обмена именно
          // с этой более лёгкой клеткой, а не только с диагональю под ней.
          farthestClearIdx = ni;
          if (this.canDisplace(m, nm, world, i, ni)) {
            world.swapCells(i, ni);
            return;
          }
          if (canGoDown && this.canDisplace(m, world.mat[ny * w + nx], world, i, ny * w + nx)) {
            world.swapCells(i, ny * w + nx);
            return;
          }
        } else {
          break;
        }
      }

      if (farthestClearIdx !== -1) {
        const hasSameLeft = x > 0 && world.mat[i - 1] === m;
        const hasSameRight = x + 1 < w && world.mat[i + 1] === m;
        const hasLiquidAbove = upY >= 0 && upY < h && STATE_LUT[world.mat[upY * w + x]] === 3;

        if (hasLiquidAbove || hasSameLeft || hasSameRight) {
          // Перенос использует реально найденную свободную дистанцию, а не 1 клетку.
          // Ограничение 4 при жидкости сверху сохраняет ровную поверхность без «расчёсок».
          const reach = Math.max(1, Math.min(disp, Math.abs(farthestClearIdx - i)));
          const stepDist = Math.min(reach, 4);
          const targetX = x + dir * stepDist;
          if (targetX >= 0 && targetX < w) {
            const stepIdx = y * w + targetX;
            const sm = world.mat[stepIdx];
            if (sm === MAT.EMPTY || STATE_LUT[sm] === 4 || (STATE_LUT[sm] === 3 && densityAt(sm,world.temp[stepIdx]) < rho * 0.96)) {
              let blocked = false;
              for (let s = 1; s < stepDist; s++) {
                const midM = world.mat[y * w + (x + dir * s)];
                if (STATE_LUT[midM] === 1 || midM === m) {
                  blocked = true;
                  break;
                }
              }
              if (!blocked) {
                world.swapCells(i, stepIdx);
                return;
              }
            }
          }
        }
      }
    }
  }

  private stepGasOrEnergy(world: World, x: number, y: number, i: number, m: number, tick: number): void {
    const w = world.width;

    if (m === MAT.NEUTRON) {
      if (world.meta[i] <= 1) {
        world.mat[i] = MAT.EMPTY;
        return;
      }
      world.meta[i]--;

      let vx = world.vx[i];
      let vy = world.vy[i];
      if (Math.hypot(vx, vy) < 1.5) {
        const ang = world.rand() * Math.PI * 2;
        vx = Math.cos(ang) * 3.6;
        vy = Math.sin(ang) * 3.6;
        world.vx[i] = vx;
        world.vy[i] = vy;
      }

      const nx = Math.round(x + vx);
      const ny = Math.round(y + vy);
      if (!world.inBounds(nx, ny)) {
        world.mat[i] = MAT.EMPTY;
        return;
      }
      const ni = ny * w + nx;
      const nm = world.mat[ni];
      if (nm === MAT.EMPTY || nm === MAT.GLASS) {
        if (nm === MAT.EMPTY) {
          world.swapCells(i, ni);
        } else {
          const nnx = Math.round(nx + vx);
          const nny = Math.round(ny + vy);
          if (world.inBounds(nnx, nny) && world.mat[nny * w + nnx] === MAT.EMPTY) {
            world.swapCells(i, nny * w + nnx);
          }
        }
      } else if (nm === MAT.CONCRETE || nm === MAT.STEEL || nm === MAT.TITANIUM) {
        world.vx[i] = -vx + (world.rand() - 0.5);
        world.vy[i] = -vy + (world.rand() - 0.5);
      }
      world.stamp[i] = tick;
      return;
    }

    if (m === MAT.ELECTRIC_ARC) {
      world.stamp[i] = tick;
      return;
    }

    const rho = DENSITY_LUT[m];
    // A gas bubble displaces heavier liquid in the buoyant direction.
    if (STATE_LUT[m] === 4 && Math.abs(world.env.gravity) > .05) {
      const up = y + (world.env.gravity > 0 ? -1 : 1);
      if (up >= 0 && up < world.height) {
        const target = up * w + x, targetMat = world.mat[target];
        if (STATE_LUT[targetMat] === 3 && DENSITY_LUT[targetMat] > rho && world.rand() < .45) {
          world.swapCells(i, target); return;
        }
      }
    }
    const ai = world.airIdxFromCell(x, y);
    const windX = world.airVx[ai] * 0.24;
    const windY = world.airVy[ai] * 0.24;
    const gravScale = world.env.gravity / 9.81;
    const buoyancyVy = ((rho - 1.225) / 1.4) * gravScale;

    const driftX = windX + (world.rand() - 0.5) * 1.5;
    const driftY = windY + Math.max(-1.6, Math.min(1.4, buoyancyVy)) + (world.rand() - 0.5) * 0.9;

    const dx = driftX > 0.32 ? 1 : driftX < -0.32 ? -1 : 0;
    const dy = driftY > 0.28 ? 1 : driftY < -0.28 ? -1 : 0;
    if (dx === 0 && dy === 0) return;

    // Unrolled 3-candidate check (zero array allocation!)
    for (let c = 0; c < 3; c++) {
      const nx = c === 2 ? x : x + dx;
      const ny = c === 1 ? y : y + dy;
      if (!world.inBounds(nx, ny)) continue;
      // Do not move a gas diagonally through a sealed corner of two solids.
      if (nx !== x && ny !== y && STATE_LUT[world.mat[y * w + nx]] === 1 && STATE_LUT[world.mat[ny * w + x]] === 1) continue;
      const ni = ny * w + nx;
      const nm = world.mat[ni];
      if (nm === MAT.EMPTY) {
        world.swapCells(i, ni);
        return;
      }
      if (STATE_LUT[nm] === 4 && dy < 0 && DENSITY_LUT[nm] > rho * 1.15 && world.rand() < 0.55) {
        world.swapCells(i, ni);
        return;
      }
    }
  }

  private updateHandGrab(world: World): void {
    const hand = world.hand;
    if (!hand.active) return;

    if (!hand.detached) {
      const dx = hand.targetX - hand.anchorX;
      const dy = hand.targetY - hand.anchorY;
      const pullDist = Math.hypot(dx, dy);
      hand.pullForce = pullDist * 26;

      let avgStrength = 0;
      let validCount = 0;
      for (const idx of hand.sourceIndices) {
        const m = world.mat[idx];
        if (m === MAT.EMPTY) continue;
        world.stress[idx] = Math.min(2500, hand.pullForce);
        avgStrength += TENSILE_LUT[m] || 40;
        validCount++;
      }

      if (validCount === 0) {
        hand.active = false;
        return;
      }
      avgStrength /= validCount;

      const tearThreshold = Math.min(620, 45 + avgStrength * 0.24);
      if (hand.pullForce >= tearThreshold || avgStrength < 10) {
        hand.cluster = [];
        const cx = Math.round(hand.anchorX);
        const cy = Math.round(hand.anchorY);

        for (const idx of hand.sourceIndices) {
          const m = world.mat[idx];
          if (m === MAT.EMPTY) continue;
          const px = idx % world.width;
          const py = (idx / world.width) | 0;
          hand.cluster.push({
            dx: px - cx,
            dy: py - cy,
            mat: m,
            temp: world.temp[idx],
            wetness: world.wetness[idx],
            absorbedMat: world.absorbedMat[idx],
            meta: world.meta[idx],
            seed: world.seed[idx],
          });
          world.mat[idx] = MAT.EMPTY;
          world.stress[idx] = 0;
        }

        const oxs = [1, -1, 0, 0];
        const oys = [0, 0, 1, -1];
        for (const p of hand.cluster) {
          const rx = cx + p.dx;
          const ry = cy + p.dy;
          for (let d = 0; d < 4; d++) {
            const bx = rx + oxs[d];
            const by = ry + oys[d];
            if (!world.inBounds(bx, by)) continue;
            const bi = by * world.width + bx;
            if (STATE_LUT[world.mat[bi]] === 1 && world.rand() < 0.28) {
              world.fractureCell(bi, dx, dy, Math.max(1, pullDist), 0.65);
            }
          }
        }

        hand.detached = true;
        world.events.fractureCount += 8;
      }
    } else {
      const cx = Math.round(hand.targetX);
      const cy = Math.round(hand.targetY);
      const swingSpeed = Math.hypot(hand.vx, hand.vy);

      if (swingSpeed > 0.8) {
        for (const p of hand.cluster) {
          const wx = cx + p.dx;
          const wy = cy + p.dy;
          if (!world.inBounds(wx, wy)) continue;
          const wi = wy * world.width + wx;
          const wm = world.mat[wi];
          if (wm === MAT.EMPTY) continue;
          const wst = STATE_LUT[wm];
          if (wst === 2 || wst === 3 || wst === 4) {
            world.vx[wi] += hand.vx * 1.25 + (world.rand() - 0.5) * 2;
            world.vy[wi] += hand.vy * 1.25 - 0.8;
          } else if (wst === 1 && swingSpeed * 28 > TENSILE_LUT[wm]) {
            world.fractureCell(wi, hand.vx, hand.vy, swingSpeed, swingSpeed * 0.35);
          }
        }
      }
    }
  }

  private applyBoundaries(world: World): void {
    const mode = world.env.boundary;
    if (mode === 'closed') return;

    const w = world.width;
    const h = world.height;
    const mat = world.mat;

    for (let x = 0; x < w; x++) {
      const mTop = mat[x];
      if (STATE_LUT[mTop] === 4 || STATE_LUT[mTop] === 5) {
        mat[x] = MAT.EMPTY;
      }
      if (mode === 'open_all') {
        const iBot = (h - 1) * w + x;
        if (STATE_LUT[mat[iBot]] !== 1) mat[iBot] = MAT.EMPTY;
      }
    }

    if (mode === 'open_all') {
      for (let y = 0; y < h; y++) {
        const iL = y * w;
        const iR = y * w + (w - 1);
        if (STATE_LUT[mat[iL]] !== 1) mat[iL] = MAT.EMPTY;
        if (STATE_LUT[mat[iR]] !== 1) mat[iR] = MAT.EMPTY;
      }
    }
  }
}
