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

export interface SensorPin {
  id: number;
  x: number;
  y: number;
  // Smoothed callout box anchor in simulation coords so leader box glides smoothly without jitter
  boxX?: number;
  boxY?: number;
}

export interface EnvironmentConfig {
  preset: EnvironmentPreset;
  lastBasePreset: 'street' | 'home';
  ambientTempC: number;
  humidity: number;
  pressureKPa: number;
  gravity: number;
  windSpeed: number;
  windAngleDeg: number;
  windGusts: boolean;
  precipitation: boolean;
  storm: boolean;
  boundary: BoundaryMode;
}

export interface GameSettings {
  computeMode: ComputeMode;
  substeps: number;
  resolutionPreset: 'standard' | 'high' | 'ultra';
  hdrBloom: boolean;
  bloomIntensity: number;
  realisticTextures: boolean;
  refractionAndSpec: boolean;
  heatShimmer: boolean;
  airVectorsOverlay: boolean;
  structuralStress: boolean;
  soundEnabled: boolean;
  soundVolume: number;
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

  density: number;
  specificHeat: number;
  thermalCond: number;
  defaultTempC?: number;

  meltTempC?: number;
  meltInto?: number;
  boilTempC?: number;
  boilInto?: number;
  freezeTempC?: number;
  freezeInto?: number;

  flammability: number;
  ignitionTempC?: number;
  burnHeat?: number;
  explosivePower?: number;
  detonationShockKPa?: number;
  acidResistance: number;
  porosity: number;
  waterSoluble?: boolean;

  viscosity: number;
  dispersion: number;
  reposeSkip: number;

  tensileStrength: number;

  elecCond: number;
  elecResistanceHeat?: number;

  baseColor: [number, number, number];
  accentColor: [number, number, number];
  metallic: number;
  roughness: number;
  opacity: number;
  emissive: number;
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
