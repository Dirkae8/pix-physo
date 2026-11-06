import type { CategoryId, MaterialDef, PhaseState } from '../types/physics';

/**
 * Расширение каталога PIXPHYSO: 100 новых выбираемых предметов (id 145..244)
 * и 6 скрытых продуктов реакций (id 245..250). Лимит 255 выбран потому, что
 * поле мира хранит id вещества в Uint8Array, а GPU-шейдер восстанавливает его
 * из байта текстуры состояний.
 *
 * Все величины взяты из справочников (кг/м³, кДж/(кг·К), °C) и приведены к
 * внутренней шкале коэффициентов движка, заданной базовыми веществами.
 */
export const XMAT = {
  // --- Твёрдые 145..166 ---
  WICK: 145,
  PLASTIC_ABS: 146,
  PVC: 147,
  POLYETHYLENE: 148,
  KEVLAR: 149,
  PAPER: 150,
  CARDBOARD: 151,
  STYROFOAM: 152,
  SILICONE: 153,
  PLYWOOD: 154,
  COTTON_CLOTH: 155,
  CORK: 156,
  LINOLEUM: 157,
  DRYWALL: 158,
  CERAMIC_WOOL: 159,
  FR4: 160,
  COPPER_PLATE: 161,
  BRASS: 162,
  CAST_IRON: 163,
  ASPHALT: 164,
  GRAPHITE_BLOCK: 165,
  MARBLE: 166,

  // --- Сыпучие 167..180 ---
  DRY_WATER: 167,
  FLOUR: 168,
  STARCH: 169,
  COCOA: 170,
  DETERGENT: 171,
  SILICA_GEL: 172,
  ALUMINUM_FILINGS: 173,
  TITANIUM_FILINGS: 174,
  GLASS_GRIT: 175,
  ALUMINA: 176,
  GYPSUM: 177,
  BAKING_SODA: 178,
  COAL_DUST: 179,
  EXPANDED_CLAY: 180,

  // --- Жидкости 181..200 ---
  CHICKEN_BROTH: 181,
  VEGETABLE_OIL: 182,
  MILK: 183,
  VINEGAR: 184,
  SOY_SAUCE: 185,
  BEER: 186,
  RED_WINE: 187,
  COFFEE_DRINK: 188,
  CONDENSED_MILK: 189,
  ORANGE_JUICE: 190,
  MAPLE_SYRUP: 191,
  DIESEL: 192,
  KEROSENE: 193,
  ACETONE: 194,
  BENZENE: 195,
  TOLUENE: 196,
  TURPENTINE: 197,
  OLIVE_OIL: 198,
  CASTOR_OIL: 199,
  LIQUID_SOAP: 200,

  // --- Газы 201..214 ---
  OZONE: 201,
  NITROUS_OXIDE: 202,
  CARBON_MONOXIDE: 203,
  SULFUR_DIOXIDE: 204,
  HYDROGEN_SULFIDE: 205,
  BUTANE: 206,
  ETHYLENE: 207,
  XENON: 208,
  KRYPTON: 209,
  WATER_MIST: 210,
  ACID_FUMES: 211,
  HYDROGEN_CHLORIDE: 212,
  BIOGAS: 213,
  SF6: 214,

  // --- Электрика 215..224 ---
  GOLD_WIRE: 215,
  NICHROME_WIRE: 216,
  SUPERCONDUCTOR: 217,
  GRAPHENE_WIRE: 218,
  CERAMIC_INSULATOR: 219,
  GLASS_INSULATOR: 220,
  PIEZO: 221,
  THERMOCOUPLE: 222,
  LED_STRIP: 223,
  WIRE_RESISTOR: 224,

  // --- Взрывчатые вещества 225..234 ---
  AMMONAL: 225,
  ANFO: 226,
  MERCURY_FULMINATE: 227,
  LEAD_AZIDE: 228,
  PICRIC_ACID: 229,
  TETRYL: 230,
  HMX: 231,
  NITROCELLULOSE: 232,
  NITROMETHANE: 233,
  PYRO_MIX: 234,

  // --- Инструменты 235..238 ---
  TOOL_MAGNET: 235,
  TOOL_VACUUM: 236,
  TOOL_HAMMER: 237,
  TOOL_DRYER: 238,

  // --- Дополнительные твёрдые, сыпучие и газы 239..244 ---
  ACRYLIC_GLASS: 239,
  BASALT_SLAB: 240,
  CHALK: 241,
  GRAPHITE_DUST: 242,
  MERCURY_VAPOR: 243,
  RADON: 244,
} as const;

/** Скрытые продукты плавления, кипения и горения (в каталоге не выбираются). */
export const XSTATE = {
  MOLTEN_PLASTIC: 245,
  BROTH_VAPOR: 246,
  OIL_VAPOR: 247,
  SOLVENT_VAPOR: 248,
  PLASTIC_FUME: 249,
  PAPER_ASH: 250,
} as const;

export const EXPANSION_SELECTABLE_IDS: ReadonlySet<number> = new Set<number>(Object.values(XMAT));

/** Новые жидкости, которые пористые тела (фитиль, губка, вата) впитывают капиллярами. */
export const EXPANSION_LIQUID_IDS: readonly number[] = [
  XMAT.CHICKEN_BROTH, XMAT.VEGETABLE_OIL, XMAT.MILK, XMAT.VINEGAR,
  XMAT.SOY_SAUCE, XMAT.BEER, XMAT.RED_WINE, XMAT.COFFEE_DRINK,
  XMAT.CONDENSED_MILK, XMAT.ORANGE_JUICE, XMAT.MAPLE_SYRUP, XMAT.DIESEL,
  XMAT.KEROSENE, XMAT.ACETONE, XMAT.BENZENE, XMAT.TOLUENE,
  XMAT.TURPENTINE, XMAT.OLIVE_OIL, XMAT.CASTOR_OIL, XMAT.LIQUID_SOAP,
];

/** Новые взрывчатые вещества, чувствительные к ударной волне. */
export const EXPANSION_EXPLOSIVE_IDS: readonly number[] = [
  XMAT.AMMONAL, XMAT.ANFO, XMAT.MERCURY_FULMINATE, XMAT.LEAD_AZIDE,
  XMAT.PICRIC_ACID, XMAT.TETRYL, XMAT.HMX, XMAT.NITROCELLULOSE,
  XMAT.NITROMETHANE, XMAT.PYRO_MIX,
];

/** Новые инструменты, обрабатываемые кистью в SimulationEngine. */
export const EXPANSION_TOOL_IDS: readonly number[] = [
  XMAT.TOOL_MAGNET, XMAT.TOOL_VACUUM, XMAT.TOOL_HAMMER, XMAT.TOOL_DRYER,
];
