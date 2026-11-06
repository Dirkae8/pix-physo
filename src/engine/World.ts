import {
  EnvironmentConfig,
  FanDirection,
  GameSettings,
  HoverProbe,
  SensorPin,
} from '../types/physics';
import { MAT, MATERIAL_BY_ID, STATE_LUT, TENSILE_LUT, densityAt } from '../materials/registry';
import type { HangingWire } from './Wires';
import type { Wheel, MechanicalSpring } from './MechanicalSystem';

interface BlastPoint { dx: number; dy: number; dist: number; falloff: number; }
const blastKernels = new Map<number, BlastPoint[]>();
function blastKernel(radius: number): BlastPoint[] {
  let kernel = blastKernels.get(radius);
  if (kernel) return kernel;
  kernel = [];
  const r2 = radius * radius;
  for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
    const d2 = dx * dx + dy * dy;
    if (d2 > r2) continue;
    const dist = Math.sqrt(d2);
    kernel.push({ dx, dy, dist, falloff: 1 - dist / (radius + 0.5) });
  }
  if (blastKernels.size >= 32) blastKernels.delete(blastKernels.keys().next().value!);
  blastKernels.set(radius, kernel);
  return kernel;
}


export interface GrabbedParticle {
  dx: number;
  dy: number;
  mat: number;
  temp: number;
  wetness: number;
  absorbedMat: number;
  meta: number;
  seed: number;
}

export interface HandGrabState {
  active: boolean;
  anchorX: number;
  anchorY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  detached: boolean;
  pullForce: number;
  cluster: GrabbedParticle[];
  sourceIndices: number[]; // While still attached before tearing free
}

interface WorldSnapshot {
  mat: Uint8Array;
  temp: Float32Array;
  wetness: Uint8Array;
  absorbedMat: Uint8Array;
  meta: Uint8Array;
  seed: Uint8Array;
  sensors: SensorPin[];
  wires: HangingWire[];
  wheels: Wheel[];
  mechanicalSprings: MechanicalSpring[];
}

export const PRESET_STREET: Omit<EnvironmentConfig, 'preset' | 'lastBasePreset'> = {
  ambientTempC: 18,
  humidity: 62,
  pressureKPa: 101.325,
  gravity: 9.81,
  windSpeed: 2.4,
  windAngleDeg: 0, // Blowing gently East (->)
  windGusts: true,
  precipitation: false,
  storm: false,
  boundary: 'open_sky',
};

export const PRESET_HOME: Omit<EnvironmentConfig, 'preset' | 'lastBasePreset'> = {
  ambientTempC: 22,
  humidity: 45,
  pressureKPa: 101.325,
  gravity: 9.81,
  windSpeed: 0,
  windAngleDeg: 0,
  windGusts: false,
  precipitation: false,
  storm: false,
  boundary: 'closed',
};

export function getResolutionDims(preset: GameSettings['resolutionPreset']): [number, number] {
  switch (preset) {
    case 'large':
      return [960, 540];
    case 'ultra':
      return [680, 382];
    case 'high':
      return [576, 324];
    case 'standard':
    default:
      return [480, 270];
  }
}

export class World {
  public width: number;
  public height: number;
  public size: number;

  /** Таблицы для хуков элементов: без обращения к объектам определений в циклах. */
  public readonly stateLut = STATE_LUT;
  public readonly tensileLut = TENSILE_LUT;
  /** Длительность одного фиксированного такта в секундах реального времени. */
  public dtSeconds = 1 / 60;

  // Coarse 4x4 continuum air Navier-Stokes grid (like The Powder Toy)
  public readonly airScale = 4;
  public airW: number;
  public airH: number;
  public airSize: number;

  // Particle / Cell SoA arrays
  public mat!: Uint8Array;
  public temp!: Float32Array;
  public vx!: Float32Array;
  public vy!: Float32Array;
  public wetness!: Uint8Array;
  public absorbedMat!: Uint8Array;
  public volt!: Float32Array;
  public current!: Float32Array;
  public meta!: Uint8Array;
  public stress!: Float32Array;
  public seed!: Uint8Array;
  public stamp!: Uint16Array;
  /** 0 = строка пустая, 1 = есть вещество, 2 = соседняя с активной (ореол). */
  public rowActive!: Uint8Array;
  /** Поддерживается инкрементально при упаковке GPU-текстур. */
  public particleCount = 0;

  // Coarse air grid; the physics runs on the CPU.
  public airPressure!: Float32Array; // Delta kPa relative to env.pressureKPa
  public airVx!: Float32Array;       // m/s
  public airVy!: Float32Array;       // m/s
  public airOxygen!: Float32Array;   // local oxygen fraction, 0..0.21
  public airWall!: Uint8Array;       // 1 if blocked by solid cell
  public waveHeight!: Float32Array;  // wind-driven shallow-water surface displacement
  public waveVelocity!: Float32Array;

  // Packed RGBA8 texture buffer uploaded to the GPU for rendering:
  // R = material id, G = normalized temp/glow, B = seed/wetness, A = volt/meta/stress
  public gpuStateTexA!: Uint8Array;
  public gpuStateTexB!: Uint8Array;

  public sensors: SensorPin[] = [];
  public wires: HangingWire[] = [];
  public wheels: Wheel[] = [];
  public mechanicalSprings: MechanicalSpring[] = [];
  public stepTick = 1;
  public timeSec = 0;
  public activeFanDir: FanDirection = 0;
  public activeFanPower = 1;

  public env: EnvironmentConfig = {
    preset: 'street',
    lastBasePreset: 'street',
    ...PRESET_STREET,
  };

  public hand: HandGrabState = {
    active: false,
    anchorX: 0,
    anchorY: 0,
    targetX: 0,
    targetY: 0,
    vx: 0,
    vy: 0,
    detached: false,
    pullForce: 0,
    cluster: [],
    sourceIndices: [],
  };

  // Sound event accumulators for procedural audio feedback
  public events = {
    explosionEnergy: 0,
    electricArcCount: 0,
    sizzleCount: 0,
    fractureCount: 0,
    fanActiveCount: 0,
  };

  private undoStack: WorldSnapshot[] = [];
  private readonly maxUndo = 12;
  private rngState = 0x9e3779b9;

  constructor(width = 480, height = 270) {
    this.width = width;
    this.height = height;
    this.size = width * height;
    this.airW = Math.ceil(width / this.airScale);
    this.airH = Math.ceil(height / this.airScale);
    this.airSize = this.airW * this.airH;
    this.allocate();
  }

  private allocate(): void {
    const n = this.size;
    this.mat = new Uint8Array(n);
    this.temp = new Float32Array(n);
    this.vx = new Float32Array(n);
    this.vy = new Float32Array(n);
    this.wetness = new Uint8Array(n);
    this.absorbedMat = new Uint8Array(n);
    this.volt = new Float32Array(n);
    this.current = new Float32Array(n);
    this.meta = new Uint8Array(n);
    this.stress = new Float32Array(n);
    this.seed = new Uint8Array(n);
    this.stamp = new Uint16Array(n);
    this.rowActive = new Uint8Array(this.height);
    this.rowActive.fill(1); // при прямом вызове решателей из тестов всё активно

    this.airPressure = new Float32Array(this.airSize);
    this.airVx = new Float32Array(this.airSize);
    this.airVy = new Float32Array(this.airSize);
    this.airOxygen = new Float32Array(this.airSize);
    this.airOxygen.fill(.21);
    this.airWall = new Uint8Array(this.airSize);
    this.waveHeight = new Float32Array(this.width);
    this.waveVelocity = new Float32Array(this.width);

    this.gpuStateTexA = new Uint8Array(n * 4);
    this.gpuStateTexB = new Uint8Array(n * 4);

    this.temp.fill(this.env.ambientTempC);
    for (let i = 0; i < n; i++) {
      this.seed[i] = this.randByte();
    }
  }

  public resize(newWidth: number, newHeight: number): void {
    if (newWidth === this.width && newHeight === this.height) return;
    this.width = newWidth;
    this.height = newHeight;
    this.size = newWidth * newHeight;
    this.airW = Math.ceil(newWidth / this.airScale);
    this.airH = Math.ceil(newHeight / this.airScale);
    this.airSize = this.airW * this.airH;
    this.undoStack = [];
    this.sensors = [];
    this.wires = [];
    this.wheels = []; this.mechanicalSprings = [];
    this.allocate();
  }

  // Fast Xorshift32 PRNG (deterministic, 10x faster than Math.random)
  public rand(): number {
    let x = this.rngState | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x;
    return (x >>> 0) / 4294967296;
  }

  public randByte(): number {
    let x = this.rngState | 0;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.rngState = x;
    return x & 0xff;
  }

  public inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  public idx(x: number, y: number): number {
    return y * this.width + x;
  }

  public airIdxFromCell(x: number, y: number): number {
    const ax = Math.min(this.airW - 1, Math.max(0, x >> 2));
    const ay = Math.min(this.airH - 1, Math.max(0, y >> 2));
    return ay * this.airW + ax;
  }

  /**
   * Один проход по миру вместо полных проходов в каждом решателе.
   * Помечает строки, где есть вещество, и ореол вокруг них — остальные
   * решатели пропускают одной проверкой на строку. Качество физики не меняется.
   */
  public refreshActivity(): void {
    const w = this.width, h = this.height, mat = this.mat, rows = this.rowActive;
    rows.fill(0);
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 0; x < w; x++) {
        if (mat[row + x] !== 0) { rows[y] = 1; break; }
      }
    }
    for (let y = 0; y < h; y++) {
      if (rows[y] !== 0) continue;
      if ((y > 0 && rows[y - 1] === 1) || (y + 1 < h && rows[y + 1] === 1)) rows[y] = 2;
    }
  }

  public clear(): void {
    this.pushUndo();
    this.sensors = [];
    this.wires = [];
    this.wheels = []; this.mechanicalSprings = [];
    this.mat.fill(MAT.EMPTY);
    this.temp.fill(this.env.ambientTempC);
    this.vx.fill(0);
    this.vy.fill(0);
    this.wetness.fill(0);
    this.absorbedMat.fill(0);
    this.volt.fill(0);
    this.current.fill(0);
    this.meta.fill(0);
    this.stress.fill(0);
    this.airPressure.fill(0);
    this.airVx.fill(0);
    this.airVy.fill(0);
    this.airOxygen.fill(.21);
    this.airWall.fill(0);
    this.waveHeight.fill(0); this.waveVelocity.fill(0);
    for (let i = 0; i < this.size; i++) {
      this.seed[i] = this.randByte();
    }
    this.releaseHand(true);
  }

  public pushUndo(): void {
    if (this.undoStack.length >= this.maxUndo) {
      this.undoStack.shift();
    }
    this.undoStack.push({
      mat: this.mat.slice(),
      temp: this.temp.slice(),
      wetness: this.wetness.slice(),
      absorbedMat: this.absorbedMat.slice(),
      meta: this.meta.slice(),
      seed: this.seed.slice(),
      sensors: this.sensors.map(pin => ({...pin})),
      wires: this.wires.map(wire => ({...wire, points: wire.points.map(point => ({...point}))})),
      wheels: this.wheels.map(wheel => ({...wheel})),
      mechanicalSprings: this.mechanicalSprings.map(spring => ({...spring})),
    });
  }

  public popUndo(): boolean {
    const snap = this.undoStack.pop();
    if (!snap) return false;
    this.mat.set(snap.mat);
    this.temp.set(snap.temp);
    this.wetness.set(snap.wetness);
    this.absorbedMat.set(snap.absorbedMat);
    this.meta.set(snap.meta);
    this.seed.set(snap.seed);
    this.sensors = snap.sensors;
    this.wires = snap.wires;
    this.wheels = snap.wheels; this.mechanicalSprings = snap.mechanicalSprings;
    this.vx.fill(0);
    this.vy.fill(0);
    this.volt.fill(0);
    this.current.fill(0);
    this.stress.fill(0);
    this.releaseHand(true);
    return true;
  }

  public resetUndoHistory(): void { this.undoStack = []; }

  public applyPreset(preset: 'street' | 'home'): void {
    const base = preset === 'street' ? PRESET_STREET : PRESET_HOME;
    this.env = {
      preset,
      lastBasePreset: preset,
      ...base,
    };
    // Update empty air cells gently toward new ambient temperature
    for (let i = 0; i < this.size; i++) {
      if (this.mat[i] === MAT.EMPTY) {
        this.temp[i] = base.ambientTempC;
      }
    }
  }

  public resetEnvironment(): void {
    this.applyPreset(this.env.lastBasePreset);
  }

  public setCell(x: number, y: number, matId: number, customTemp?: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    const i = y * this.width + x;
    const def = MATERIAL_BY_ID[matId];
    this.mat[i] = matId;
    this.temp[i] = customTemp ?? def.defaultTempC ?? this.env.ambientTempC;
    this.vx[i] = 0;
    this.vy[i] = 0;
    this.wetness[i] =
      matId === MAT.FIRE
        ? 150 + (this.randByte() & 63)
        : matId === MAT.PLASMA || matId === MAT.ELECTRIC_ARC
        ? 95 + (this.randByte() & 63)
        : matId === MAT.NEUTRON
        ? 220
        : matId === MAT.STEAM || matId === MAT.SMOKE
        ? 180 + (this.randByte() & 63)
        : 0;
    this.absorbedMat[i] = 0;
    this.volt[i] = matId === MAT.GENERATOR ? 48 : matId === MAT.BATTERY ? 24 : 0;
    this.current[i] = 0;
    this.stress[i] = 0;
    this.seed[i] = this.randByte();

    if (matId === MAT.GAS_CYLINDER) {
      this.meta[i] = 127; // seven-bit compressed gas charge; high bit is the valve.
    } else if (matId === MAT.BATTERY) {
      this.meta[i] = 240; // 96% charged
    } else if (matId === MAT.SWITCH || matId === MAT.FUSE) {
      this.meta[i] = 1; // Default ON when placed; click toggles ON/OFF
    } else if (matId === MAT.FAN) {
      this.meta[i] = this.activeFanDir | (Math.max(1, Math.min(63, Math.round(this.activeFanPower * 63))) << 2);
    } else if (matId === MAT.DIODE || matId === MAT.PUMP || matId === MAT.VALVE || matId === MAT.RELAY || matId === MAT.COMPRESSOR || matId === MAT.VACUUM_PUMP) {
      this.meta[i] = this.activeFanDir;
    } else if (matId === MAT.NEUTRON) {
      const ang = this.rand() * Math.PI * 2;
      this.vx[i] = Math.cos(ang) * 3.8;
      this.vy[i] = Math.sin(ang) * 3.8;
      this.meta[i] = 220;
    } else {
      this.meta[i] = 0;
    }
  }

  public swapCells(i: number, j: number): void {
    const m = this.mat[i];
    this.mat[i] = this.mat[j];
    this.mat[j] = m;

    const t = this.temp[i];
    this.temp[i] = this.temp[j];
    this.temp[j] = t;

    const vx = this.vx[i];
    this.vx[i] = this.vx[j];
    this.vx[j] = vx;

    const vy = this.vy[i];
    this.vy[i] = this.vy[j];
    this.vy[j] = vy;

    const w = this.wetness[i];
    this.wetness[i] = this.wetness[j];
    this.wetness[j] = w;

    const ab = this.absorbedMat[i];
    this.absorbedMat[i] = this.absorbedMat[j];
    this.absorbedMat[j] = ab;

    const v = this.volt[i];
    this.volt[i] = this.volt[j];
    this.volt[j] = v;

    const cur = this.current[i];
    this.current[i] = this.current[j];
    this.current[j] = cur;

    const mt = this.meta[i];
    this.meta[i] = this.meta[j];
    this.meta[j] = mt;

    const st = this.stress[i];
    this.stress[i] = this.stress[j];
    this.stress[j] = st;

    const sd = this.seed[i];
    this.seed[i] = this.seed[j];
    this.seed[j] = sd;

    this.stamp[i] = this.stepTick;
    this.stamp[j] = this.stepTick;
  }

  public addImpulseExplosion(cx: number, cy: number, radius: number, power: number, peakTempC: number): void {
    radius = Math.max(1, Math.round(radius));
    this.events.explosionEnergy += power * radius;

    // Inject shockwave overpressure and radial blast velocity into Air Grid
    const airR = Math.max(2, Math.ceil(radius / this.airScale) + 2);
    const airR2 = airR * airR;
    const acx = cx / this.airScale;
    const acy = cy / this.airScale;
    for (let ay = Math.max(0, Math.floor(acy - airR)); ay <= Math.min(this.airH - 1, Math.ceil(acy + airR)); ay++) {
      for (let ax = Math.max(0, Math.floor(acx - airR)); ax <= Math.min(this.airW - 1, Math.ceil(acx + airR)); ax++) {
        const dx = ax - acx;
        const dy = ay - acy;
        const dist2 = dx * dx + dy * dy;
        if (dist2 <= airR2) {
          const dist = Math.sqrt(dist2);
          const falloff = 1 - dist / (airR + 0.5);
          const ai = ay * this.airW + ax;
          this.airPressure[ai] += power * 420 * falloff * falloff;
          if (dist > 0.05) {
            const boost = (power * 48 * falloff) / dist;
            this.airVx[ai] += dx * boost;
            this.airVy[ai] += dy * boost;
          }
        }
      }
    }

    // Apply blast stress, fracture solids, heat core, and fling shrapnel
    // Cached radial geometry keeps the same blast calculations and random order.
    for (const { dx, dy, dist, falloff } of blastKernel(radius)) {
        const x = cx + dx, y = cy + dy;
        if (!this.inBounds(x, y)) continue;
        const i = y * this.width + x;
        const m = this.mat[i];
        const overpressureKPa = power * 680 * falloff * falloff;

        this.temp[i] = Math.max(this.temp[i], peakTempC * falloff * falloff);
        this.stress[i] += overpressureKPa;

        if (m === MAT.EMPTY) {
          if (falloff > 0.55 && this.rand() < 0.72) {
            this.mat[i] = peakTempC > 3200 && falloff > 0.78 ? MAT.PLASMA : MAT.FIRE;
            this.wetness[i] = 120 + (this.randByte() & 63);
          } else if (falloff > 0.3 && this.rand() < 0.38) {
            this.mat[i] = MAT.SMOKE;
            this.wetness[i] = 180;
          }
          continue;
        }

        const def = MATERIAL_BY_ID[m];
        if (def.state === 'solid') {
          if (overpressureKPa > def.tensileStrength) {
            this.fractureCell(i, dx, dy, dist, power * falloff);
          }
        } else {
          if (dist > 0.1) {
            const inv = (power * 7.5 * falloff) / dist;
            this.vx[i] += dx * inv;
            this.vy[i] += dy * inv - 1.2 * falloff;
          }
        }
      }
  }

  public fractureCell(i: number, dx: number, dy: number, dist: number, impulse: number): void {
    const m = this.mat[i];
    this.events.fractureCount++;
    const norm = dist > 0.1 ? 1 / dist : 1;
    const ux = dist > 0.1 ? dx * norm : (this.rand() - 0.5) * 2;
    const uy = dist > 0.1 ? dy * norm : -this.rand();

    if (m === MAT.GLASS || m === MAT.LAMP) {
      this.mat[i] = MAT.GLASS_SHARDS;
    } else if (m === MAT.ICE) {
      this.mat[i] = MAT.SNOW;
    } else if (m === MAT.WOOD) {
      this.mat[i] = this.temp[i] > 350 ? MAT.CHARCOAL : MAT.SAWDUST;
    } else if (m === MAT.BRICK || m === MAT.CONCRETE || m === MAT.CERAMIC || m === MAT.BASALT) {
      this.mat[i] = this.rand() < 0.5 ? MAT.SAND : MAT.CEMENT;
    } else if (m === MAT.STEEL || m === MAT.TITANIUM || m === MAT.COPPER_WIRE || m === MAT.LEAD) {
      this.mat[i] = this.temp[i] > 900 ? MAT.EMBER : MAT.IRON_FILINGS;
    } else {
      this.mat[i] = MAT.SAND;
    }

    this.vx[i] = ux * (2.5 + impulse * 4.5);
    this.vy[i] = uy * (2.5 + impulse * 4.5) - 1.0;
  }

  public interactClickAt(cx: number, cy: number): boolean {
    // A cylinder's valve is switched by clicking directly on the cylinder.
    if (this.inBounds(cx, cy) && this.mat[cy*this.width+cx] === MAT.GAS_CYLINDER) {
      const open = (this.meta[cy*this.width+cx] & 128) === 0;
      for (let y=Math.max(0,cy-14); y<=Math.min(this.height-1,cy+14); y++) for (let x=Math.max(0,cx-14); x<=Math.min(this.width-1,cx+14); x++) {
        const j=y*this.width+x; if (this.mat[j] === MAT.GAS_CYLINDER) this.meta[j] = (this.meta[j]&127) | (open ? 128 : 0);
      }
      return true;
    }
    // Check small 5px radius around click for interactive Buttons or Switches!
    let toggledSwitch = false;
    let targetSwitchVal = 0;
    let pressedButton = false;

    for (let dy = -5; dy <= 5; dy++) {
      for (let dx = -5; dx <= 5; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!this.inBounds(x, y)) continue;
        const i = y * this.width + x;
        if (this.mat[i] === MAT.SWITCH && !toggledSwitch) {
          targetSwitchVal = this.meta[i] > 0 ? 0 : 1;
          toggledSwitch = true;
        } else if (this.mat[i] === MAT.BUTTON) {
          pressedButton = true;
        }
      }
    }

    if (toggledSwitch || pressedButton) {
      // Flood-fill connected component of that same Button or Switch block so the whole button/switch flips together!
      const radius = 14;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (!this.inBounds(x, y)) continue;
          const i = y * this.width + x;
          if (toggledSwitch && this.mat[i] === MAT.SWITCH) {
            this.meta[i] = targetSwitchVal;
          }
          if (pressedButton && this.mat[i] === MAT.BUTTON) {
            this.meta[i] = 50; // Stay closed for ~50 simulation ticks
          }
        }
      }
      return true;
    }
    return false;
  }

  public releaseHand(cancelRestore = false): void {
    if (!this.hand.active) return;
    if (this.hand.detached && !cancelRestore) {
      const cx = Math.round(this.hand.targetX);
      const cy = Math.round(this.hand.targetY);
      for (const p of this.hand.cluster) {
        const x = cx + p.dx;
        const y = cy + p.dy;
        if (!this.inBounds(x, y)) continue;
        const i = y * this.width + x;
        if (this.mat[i] === MAT.EMPTY || STATE_LUT[this.mat[i]] === 4) {
          this.mat[i] = p.mat;
          this.temp[i] = p.temp;
          this.wetness[i] = p.wetness;
          this.absorbedMat[i] = p.absorbedMat;
          this.meta[i] = p.meta;
          this.seed[i] = p.seed;
          this.vx[i] = this.hand.vx;
          this.vy[i] = this.hand.vy;
        }
      }
    }
    this.hand.active = false;
    this.hand.detached = false;
    this.hand.cluster = [];
    this.hand.sourceIndices = [];
    this.hand.pullForce = 0;
  }

  public probeAt(x: number, y: number): HoverProbe {
    if (!this.inBounds(x, y)) {
      return {
        inBounds: false,
        x,
        y,
        matId: 0,
        matName: 'Вне поля',
        tempC: this.env.ambientTempC,
        pressureKPa: this.env.pressureKPa,
        windVx: 0,
        windVy: 0,
        oxygenFraction: 0,
        voltage: 0,
        charge: 0,
        stress: 0,
        density: 1.225,
      };
    }
    const i = y * this.width + x;
    const ai = this.airIdxFromCell(x, y);
    const m = this.mat[i];
    const def = MATERIAL_BY_ID[m];
    let name = def.name;
    if (m === MAT.SWITCH) {
      name += this.meta[i] > 0 ? ' [ВКЛ]' : ' [ВЫКЛ]';
    } else if (m === MAT.BUTTON) {
      name += this.meta[i] > 0 ? ' [ЗАЖАТА]' : ' [ОТЖАТА]';
    } else if (m === MAT.BATTERY) {
      name += ` [${Math.round((this.meta[i] / 250) * 100)}%]`;
    } else if (m === MAT.GAS_CYLINDER) {
      name += ` [${Math.round((this.meta[i]&127)/127*100)}%, ${(this.meta[i]&128) ? 'открыт' : 'закрыт'}]`;
    } else if (m === MAT.FAN) {
      const arrows = ['→', '↓', '←', '↑'];
      name += ` [${arrows[this.meta[i] & 3]}]`;
    } else if (this.wetness[i] > 25 && this.absorbedMat[i] > 0 && (def.porosity > 0)) {
      name += ` (пропитан: ${MATERIAL_BY_ID[this.absorbedMat[i]].name})`;
    }

    return {
      inBounds: true,
      x,
      y,
      matId: m,
      matName: name,
      tempC: this.temp[i],
      pressureKPa: Math.max(0, this.env.pressureKPa + this.airPressure[ai]),
      windVx: this.airVx[ai],
      windVy: this.airVy[ai],
      oxygenFraction: this.airOxygen[ai],
      voltage: this.volt[i],
      charge: this.current[i],
      stress: this.stress[i],
      density: densityAt(m, this.temp[i]),
    };
  }

  public packGpuTextures(): number {
    const n = this.size;
    const mat = this.mat;
    const temp = this.temp;
    const seed = this.seed;
    const wet = this.wetness;
    const volt = this.volt;
    const cur = this.current;
    const meta = this.meta;
    const absMat = this.absorbedMat;
    const stress = this.stress;
    const texA = this.gpuStateTexA;
    const texB = this.gpuStateTexB;

    let count = 0;
    for (let i = 0; i < n; i++) {
      const m = mat[i];
      if (m !== 0) count++;
      const o = i << 2;

      // TexA: R = matId, G = temp low..high mapped (-200..2600°C -> 0..255), B = seed, A = wetness
      texA[o] = m;
      const tNorm = Math.max(0, Math.min(255, ((temp[i] + 200) * 255) / 2800));
      texA[o + 1] = tNorm;
      texA[o + 2] = seed[i];
      texA[o + 3] = wet[i];

      // TexB: R = |volt| mapped (0..60V -> 0..255), G = current/glow, B = meta, A = absorbedMat or stress
      texB[o] = Math.min(255, Math.abs(volt[i]) * 4.2);
      texB[o + 1] = Math.min(255, cur[i] * 8 + stress[i] * 0.25);
      texB[o + 2] = meta[i];
      texB[o + 3] = absMat[i];
    }
    this.particleCount = count;
    return count;
  }
}
