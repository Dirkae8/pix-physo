import { CategoryId, MaterialDef } from '../types/physics';
import { MAX_MAT_ID } from './ids';
import { ELEMENT_MODULES } from './elements';
import {
  EXPANSION_EXPLOSIVE_IDS,
  EXPANSION_LIQUID_IDS,
  EXPANSION_SELECTABLE_IDS,
  EXPANSION_TOOL_IDS,
  XMAT,
  XSTATE,
} from './expansion';

export {
  EXPANSION_EXPLOSIVE_IDS,
  EXPANSION_LIQUID_IDS,
  EXPANSION_SELECTABLE_IDS,
  EXPANSION_TOOL_IDS,
  XMAT,
  XSTATE,
};

export const MAT = {
  EMPTY: 0,

  // --- SOLIDS (1..12) ---
  BRICK: 1,
  WOOD: 2,
  STEEL: 3,
  GLASS: 4,
  TITANIUM: 5,
  CONCRETE: 6,
  ICE: 7,
  SPONGE: 8,
  RUBBER: 9,
  CERAMIC: 10,
  WAX: 11,
  LEAD: 12,

  // --- POWDERS & GRANULAR (13..23) ---
  SAND: 13,
  SOIL: 14,
  SALT: 15,
  SUGAR: 16,
  COAL: 17,
  SNOW: 18,
  SAWDUST: 19,
  CEMENT: 20,
  SODIUM: 21,
  GOLD: 22,
  IRON_FILINGS: 23,

  // --- LIQUIDS (24..34) ---
  WATER: 24,
  MERCURY: 25,
  LAVA: 26,
  MOTOR_OIL: 27,
  CRUDE_OIL: 28,
  GASOLINE: 29,
  ACID: 30,
  LIQUID_NITROGEN: 31,
  ETHANOL: 32,
  HONEY: 33,
  NITROGLYCERIN: 34,

  // --- GASES (35..43) ---
  HYDROGEN: 35,
  METHANE: 36,
  PROPANE: 37,
  ACETYLENE: 38,
  OXYGEN: 39,
  STEAM: 40,
  SMOKE: 41,
  CO2: 42,
  CHLORINE: 43,

  // --- ELECTRICITY & MECHANICS (44..54) ---
  COPPER_WIRE: 44,
  INSULATED_WIRE: 45,
  BATTERY: 46,
  GENERATOR: 47,
  BUTTON: 48,
  SWITCH: 49,
  FAN: 50,
  HEATER: 51,
  LAMP: 52,
  TESLA_COIL: 53,
  DETONATOR: 54,

  // --- EXPLOSIVES, CHEMICAL & NUCLEAR (55..61) ---
  GUNPOWDER: 55,
  TNT: 56,
  C4: 57,
  THERMITE: 58,
  NAPALM: 59,
  URANIUM: 60,
  NEUTRON: 61,

  // --- TOOLS & ENERGY (62..68) ---
  FIRE: 62,
  PLASMA: 63,
  TOOL_HAND: 64,
  TOOL_HEAT: 65,
  TOOL_COOL: 66,
  TOOL_WIND: 67,
  TOOL_ERASER: 68,

  // --- DYNAMIC PHASE-TRANSITION & REACTION STATES (69..77) ---
  MOLTEN_METAL: 69,
  MOLTEN_GLASS: 70,
  SALTWATER: 71,
  SYRUP: 72,
  BASALT: 73,
  CHARCOAL: 74,
  GLASS_SHARDS: 75,
  FUEL_VAPOR: 76,
  ELECTRIC_ARC: 77,
  EMBER: 78,
  MOLTEN_WAX: 79,
  GRANITE: 80,
  ALUMINUM: 81,
  OBSIDIAN: 82,
  SULFUR: 83,
  MAGNESIUM: 84,
  POTASSIUM: 85,
  QUICKLIME: 86,
  LIQUID_OXYGEN: 87,
  PEROXIDE: 88,
  GLYCERIN: 89,
  SEAWATER: 90,
  NITROGEN: 91,
  HELIUM: 92,
  NEON: 93,
  ARGON: 94,
  FLUORINE: 95,
  AMMONIA: 96,
  SILVER_WIRE: 97,
  ALUMINUM_WIRE: 98,
  RESISTOR: 99,
  CARBON_ELECTRODE: 100,
  PLUTONIUM: 101,
  RDX: 102,
  PETN: 103,
  DYNAMITE: 104,
  BLACK_POWDER: 105,
  FLASH_POWDER: 106,
  WHITE_PHOSPHORUS: 107,
  FUEL_GEL: 108,
  TOOL_SENSOR: 109,
  TOOL_LASER: 110,
  TOOL_VORTEX: 111,
  TOOL_SHOCK: 112,
  TOOL_SPARK: 113,
  TOOL_MIXER: 114,
  TOOL_CRYO: 115,
  TOOL_IGNITE: 116,
  ETHANOL_VAPOR: 117,
  MOLTEN_ALUMINUM: 118,
  MOLTEN_GOLD: 119,
  MOLTEN_LEAD: 120,
  MOLTEN_TITANIUM: 121,
  MOLTEN_IRON: 122,
  DRY_ICE: 123,
  ALKALI: 124,
  FROST: 125,
  RUST: 126,
  CAPACITOR: 127,
  DIODE: 128,
  FUSE: 129,
  THERMOSTAT: 130,
  PRESSURE_SWITCH: 131,
  PUMP: 132,
  VALVE: 133,
  TOOL_EXTINGUISHER: 134,
  WATER_VAPOR: 135,
  RELAY: 136,
  ELECTROMAGNET: 137,
  COMPRESSOR: 138,
  VACUUM_PUMP: 139,
  SOOT: 140,
  MOLTEN_COPPER: 141,
  MOLTEN_SILVER: 142,
  GAS_CYLINDER: 143,
  GROUND: 144,
} as const;

export { MAX_MAT_ID } from './ids';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  shortLabel: string;
  accent: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'all', label: 'Все предметы', shortLabel: 'Все', accent: '#38bdf8' },
  { id: 'solids', label: 'Твёрдые и стены', shortLabel: 'Твёрдые', accent: '#f97316' },
  { id: 'powders', label: 'Сыпучие вещества', shortLabel: 'Сыпучие', accent: '#eab308' },
  { id: 'liquids', label: 'Жидкости и масла', shortLabel: 'Жидкости', accent: '#06b6d4' },
  { id: 'gases', label: 'Газы и пары', shortLabel: 'Газы', accent: '#a855f7' },
  { id: 'electric', label: 'Электрика и обдув', shortLabel: 'Электрика', accent: '#10b981' },
  { id: 'explosives', label: 'Взрывчатка и атом', shortLabel: 'Взрывы', accent: '#ef4444' },
  { id: 'tools', label: 'Стихии и инструменты', shortLabel: 'Инструменты', accent: '#f43f5e' },
];

// Каталог собран из отдельных модулей: один файл = один элемент со своими
// характеристиками, реакциями и поведением. Порядок по id важен (0 = Воздух).
export const ELEMENTS = ELEMENT_MODULES;
const RAW_MATERIALS: MaterialDef[] = ELEMENT_MODULES.map((e) => e.def);

export const MATERIAL_BY_ID: MaterialDef[] = new Array(MAX_MAT_ID);
for (let i = 0; i < MAX_MAT_ID; i++) {
  MATERIAL_BY_ID[i] = RAW_MATERIALS[0];
}
for (const m of RAW_MATERIALS) {
  MATERIAL_BY_ID[m.id] = m;
}

export const SELECTABLE_MATERIALS: MaterialDef[] = RAW_MATERIALS.filter((m) => m.selectable);

// Fast numeric lookup tables for hot physics inner loops
export const DENSITY_LUT = new Float32Array(MAX_MAT_ID);
export const SPECIFIC_HEAT_LUT = new Float32Array(MAX_MAT_ID);
export const THERMAL_COND_LUT = new Float32Array(MAX_MAT_ID);
export const VISCOSITY_LUT = new Float32Array(MAX_MAT_ID);
export const DISPERSION_LUT = new Int16Array(MAX_MAT_ID);
export const ELEC_COND_LUT = new Float32Array(MAX_MAT_ID);
export const TENSILE_LUT = new Float32Array(MAX_MAT_ID);
export const POROSITY_LUT = new Float32Array(MAX_MAT_ID);
export const STATE_LUT = new Uint8Array(MAX_MAT_ID);
// STATE_LUT encoding: 0=empty, 1=solid, 2=powder, 3=liquid, 4=gas, 5=energy, 6=tool

const STATE_CODE: Record<string, number> = {
  empty: 0,
  solid: 1,
  powder: 2,
  liquid: 3,
  gas: 4,
  energy: 5,
  tool: 6,
};

for (const m of RAW_MATERIALS) {
  DENSITY_LUT[m.id] = m.density;
  SPECIFIC_HEAT_LUT[m.id] = m.specificHeat;
  THERMAL_COND_LUT[m.id] = m.thermalCond;
  VISCOSITY_LUT[m.id] = m.viscosity;
  DISPERSION_LUT[m.id] = m.dispersion;
  ELEC_COND_LUT[m.id] = m.elecCond;
  TENSILE_LUT[m.id] = m.tensileStrength;
  POROSITY_LUT[m.id] = m.porosity;
  STATE_LUT[m.id] = STATE_CODE[m.state] ?? 0;
}

/** Approximate density change with temperature; the lattice cell size stays fixed. */
export function densityAt(matId: number, tempC: number): number {
  const base = DENSITY_LUT[matId];
  if (STATE_LUT[matId] !== 3) return base;
  const t = Math.max(-50, Math.min(300, tempC));
  if (matId === MAT.WATER) {
    // Water is densest near 4 °C; calibrated relative to its 20 °C catalogue density.
    return base * Math.max(.82, Math.min(1.01, 1.001024 - .000004 * (t-4) * (t-4)));
  }
  return base * Math.max(.85, Math.min(1.05, 1 - .0003 * (t - 20)));
}
