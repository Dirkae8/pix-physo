export type CategoryId =
  | 'all'
  | 'solids'
  | 'powders'
  | 'liquids'
  | 'gases'
  | 'electric'
  | 'explosives'
  | 'tools';

export type PhaseState = 'empty' | 'solid' | 'powder' | 'liquid' | 'gas' | 'energy' | 'tool';

export type ComputeMode = 'gpu90' | 'balance70';

export type DisplayMode =
  | 'realistic'
  | 'thermal'
  | 'pressure'
  | 'velocity'
  | 'electric'
  | 'stress';

export type BoundaryMode = 'closed' | 'open_sky' | 'open_all';

export type EnvironmentPreset = 'street' | 'home' | 'custom';

export type BrushShape = 'circle' | 'square' | 'spray' | 'line';

export type FanDirection = 0 | 1 | 2 | 3; // 0: right, 1: down, 2: left, 3: up

export interface EnvironmentConfig {
  preset: EnvironmentPreset;
  lastBasePreset: 'street' | 'home';
  ambientTempC: number;       // °C (-200 .. +1200)
  humidity: number;           // % (0 .. 100)
  pressureKPa: number;        // kPa (0.2 .. 1000, normal = 101.325)
  gravity: number;            // m/s^2 (-15 .. +25, normal = 9.81)
  windSpeed: number;          // m/s (0 .. 40)
  windAngleDeg: number;       // 0° = East (+X), 90° = South (+Y), 180° = West (-X), 270° = North (-Y)
  windGusts: boolean;         // Natural atmospheric turbulence
  boundary: BoundaryMode;
}

export interface GameSettings {
  computeMode: ComputeMode;     // 'gpu90' (90% GPU / 10% CPU) or 'balance70' (70% GPU / 30% CPU)
  substeps: number;             // 1 .. 6 (default 3)
  resolutionPreset: 'standard' | 'high' | 'ultra';
  hdrBloom: boolean;
  bloomIntensity: number;       // 0 .. 1.5
  realisticTextures: boolean;
  refractionAndSpec: boolean;
  heatShimmer: boolean;
  airVectorsOverlay: boolean;
  structuralStress: boolean;
  soundEnabled: boolean;
  soundVolume: number;          // 0 .. 1
  showCrosshairInfo: boolean;
}

export interface MaterialDef {
  id: number;
  key: string;
  name: string;
  shortDesc: string;
  category: Exclude<CategoryId, 'all'>;
  state: PhaseState;
  selectable: boolean;

  // Real physical constants
  density: number;              // kg/m^3 (Air ~ 1.225, Water = 1000, Steel = 7850, Mercury = 13546, Gold = 19320)
  specificHeat: number;         // Relative heat capacity (0.1 .. 4.2, Water = 4.18)
  thermalCond: number;          // Thermal conductivity (0.01 .. 1.0 normalized from W/m·K)
  defaultTempC?: number;        // Spawn temperature if intrinsic (e.g. Lava 1150°C, Ice -10°C, LN2 -196°C)

  // Phase transition points (at 101.325 kPa)
  meltTempC?: number;
  meltInto?: number;
  boilTempC?: number;
  boilInto?: number;
  freezeTempC?: number;
  freezeInto?: number;

  // Combustion & Chemistry
  flammability: number;         // 0 .. 1 probability scale
  ignitionTempC?: number;       // °C auto-ignition or flash point
  burnHeat?: number;            // Heat released per step
  explosivePower?: number;      // Detonation overpressure & radius factor (0 = none)
  detonationShockKPa?: number;  // Overpressure threshold to detonate by shockwave
  acidResistance: number;       // 0 (dissolves fast) .. 1 (immune: glass, gold, titanium, ceramic)
  porosity: number;             // 0 .. 1 capillary liquid absorption capacity
  waterSoluble?: boolean;       // Salt, Sugar

  // Fluid / Granular rheology
  viscosity: number;            // 0 (inviscid gas/water) .. 0.98 (thick honey/lava)
  dispersion: number;           // Horizontal pressure spread range (1 .. 14)
  reposeSkip: number;           // Granular friction / angle of repose (0 = free slide, 0.8 = steep)

  // Mechanics & Fracture
  tensileStrength: number;      // kPa / stress threshold before cracking/breaking (Glass=35, Wood=110, Brick=320, Steel=1400, Titanium=2600)

  // Electricity
  elecCond: number;             // 0 (insulator) .. 1.0 (copper/gold/mercury)
  elecResistanceHeat?: number;  // Joule heating factor I^2*R (high for Nichrome)

  // Base visual RGB + optical material traits for GPU PBR shader & studio thumbnail
  baseColor: [number, number, number];
  accentColor: [number, number, number];
  metallic: number;             // 0 .. 1
  roughness: number;            // 0 .. 1
  opacity: number;              // 0 .. 1
  emissive: number;             // Intrinsic glow (0 .. 2)
  textureStyle:
    | 'brick'
    | 'wood'
    | 'brushed_metal'
    | 'glass'
    | 'concrete'
    | 'ice'
    | 'sponge'
    | 'rubber'
    | 'ceramic'
    | 'wax'
    | 'granular'
    | 'soil'
    | 'crystal'
    | 'coal'
    | 'snow'
    | 'fibers'
    | 'liquid_clear'
    | 'liquid_metal'
    | 'lava'
    | 'liquid_oil'
    | 'liquid_glow'
    | 'gas'
    | 'wire'
    | 'cable'
    | 'battery'
    | 'generator'
    | 'button'
    | 'switch'
    | 'fan'
    | 'heater'
    | 'lamp'
    | 'tesla'
    | 'detonator'
    | 'solar'
    | 'explosive'
    | 'c4'
    | 'radioactive'
    | 'plasma'
    | 'tool';
}

export interface TelemetryStats {
  fps: number;
  particleCount: number;
  gpuTimeMs: number;
  cpuTimeMs: number;
  gpuSharePct: number;
  cpuSharePct: number;
  gpuActive: boolean;
  gpuRendererName: string;
  maxPressureKPa: number;
  avgTempC: number;
}

export interface HoverProbe {
  inBounds: boolean;
  x: number;
  y: number;
  matId: number;
  matName: string;
  tempC: number;
  pressureKPa: number;
  windVx: number;
  windVy: number;
  voltage: number;
  charge: number;
  stress: number;
  density: number;
}
