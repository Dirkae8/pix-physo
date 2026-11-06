import type {
  ElementBrushHook,
  ElementModule,
  ElementStepHook,
  ElementVoltageHook,
} from './elementApi';
import { ELEMENT_MODULES } from './elements';
import { MAX_MAT_ID } from './ids';
import {
  MAT,
  DENSITY_LUT,
  DISPERSION_LUT,
  ELEC_COND_LUT,
  MATERIAL_BY_ID,
  POROSITY_LUT,
  SPECIFIC_HEAT_LUT,
  STATE_LUT,
  TENSILE_LUT,
  THERMAL_COND_LUT,
  VISCOSITY_LUT,
} from './registry';

/**
 * Исполняющая таблица элементов. Движок работает только с этими плоскими
 * массивами: ни один решатель не содержит `if (m === MAT.PAPER)`.
 * Добавление мода = `installElement()` + одна строка в его манифесте.
 */
export const ELEMENT_BY_ID: (ElementModule | undefined)[] = new Array(MAX_MAT_ID);
export const ELEMENT_STEP_HOOKS: (ElementStepHook | undefined)[] = new Array(MAX_MAT_ID);
export const ELEMENT_VOLTAGE_HOOKS: (ElementVoltageHook | undefined)[] = new Array(MAX_MAT_ID);
export const ELEMENT_BRUSH_HOOKS: (ElementBrushHook | undefined)[] = new Array(MAX_MAT_ID);

/** 1 = у вещества есть собственный шаговый хук. */
export const NEEDS_ELEMENT_STEP_LUT = new Uint8Array(MAX_MAT_ID);
/** 1 = вещество само вырабатывает напряжение. */
export const IS_VOLTAGE_SOURCE_LUT = new Uint8Array(MAX_MAT_ID);
/** Сила капиллярного всасывания (0..255). */
export const CAPILLARY_LUT = new Uint16Array(MAX_MAT_ID);
/** Жидкость впитывается пористыми телами. */
export const ABSORBABLE_LUT = new Uint8Array(MAX_MAT_ID);
/** Гасит открытое пламя. */
export const SMOTHERS_LUT = new Uint8Array(MAX_MAT_ID);
/** Водный раствор с большой скрытой теплотой парообразования. */
export const AQUEOUS_LUT = new Uint8Array(MAX_MAT_ID);
/** Карбонат: реагирует с кислотой, выделяя CO₂. */
export const CARBONATE_LUT = new Uint8Array(MAX_MAT_ID);
/** Собственный окислитель в составе. */
export const SELF_OXIDIZER_LUT = new Uint8Array(MAX_MAT_ID);
/** Интенсивность выгорания, 1/секунду реального времени. */
export const BURN_RATE_LUT = new Float32Array(MAX_MAT_ID);
/** Продукт выгорания, -1 = обычное пламя. */
export const BURN_PRODUCT_LUT = new Int16Array(MAX_MAT_ID);
/** Цвет пламени 0/1/2. */
export const FLAME_COLOR_LUT = new Uint8Array(MAX_MAT_ID);
/** Тонкий лист/волокно — особая фактура, а не монолит и не сыпучая куча. */
export const SHEET_LUT = new Uint8Array(MAX_MAT_ID);
/** Дым продукта горения: рассеивается как обычный дым. */
export const FUME_LUT = new Uint8Array(MAX_MAT_ID);

BURN_PRODUCT_LUT.fill(-1);

/** 1 = веществу нужен электрический проход/обработка устройств. */
export const NEEDS_ELECTRIC_LUT = new Uint8Array(MAX_MAT_ID);
for (let id = 0; id < MAX_MAT_ID; id++) {
  const d = MATERIAL_BY_ID[id];
  NEEDS_ELECTRIC_LUT[id] = (d.elecCond > 0 || d.category === 'electric' ||
    id === MAT.GAS_CYLINDER || id === MAT.PUMP || id === MAT.VALVE ||
    id === MAT.ELECTROMAGNET || id === MAT.COMPRESSOR || id === MAT.VACUUM_PUMP) ? 1 : 0;
}

function bind(module: ElementModule): void {
  const id = module.def.id;
  if (!Number.isInteger(id) || id < 0 || id >= MAX_MAT_ID) {
    throw new Error(`Некорректный id элемента: ${id}`);
  }
  const def = module.def;
  ELEMENT_BY_ID[id] = module;
  ELEMENT_STEP_HOOKS[id] = module.onStep;
  ELEMENT_VOLTAGE_HOOKS[id] = module.onVoltage;
  ELEMENT_BRUSH_HOOKS[id] = module.onBrush;
  NEEDS_ELEMENT_STEP_LUT[id] = module.onStep ? 1 : 0;
  IS_VOLTAGE_SOURCE_LUT[id] = module.onVoltage ? 1 : 0;

  const b = module.behavior;
  CAPILLARY_LUT[id] = b.capillary ?? 0;
  ABSORBABLE_LUT[id] = b.absorbable ? 1 : 0;
  SMOTHERS_LUT[id] = b.smothers ? 1 : 0;
  AQUEOUS_LUT[id] = b.aqueous ? 1 : 0;
  CARBONATE_LUT[id] = b.carbonate ? 1 : 0;
  SELF_OXIDIZER_LUT[id] = b.selfOxidizer ? 1 : 0;
  BURN_RATE_LUT[id] = b.burnRatePerSecond ?? 0;
  BURN_PRODUCT_LUT[id] = b.burnProduct ?? -1;
  FLAME_COLOR_LUT[id] = b.flameColor ?? 0;
  SHEET_LUT[id] = b.sheet ? 1 : 0;
  FUME_LUT[id] = b.fume ? 1 : 0;

  // Синхронизируем движковые LUT на случай установки мода во время работы.
  MATERIAL_BY_ID[id] = def;
  DENSITY_LUT[id] = def.density;
  SPECIFIC_HEAT_LUT[id] = def.specificHeat;
  THERMAL_COND_LUT[id] = def.thermalCond;
  VISCOSITY_LUT[id] = def.viscosity;
  DISPERSION_LUT[id] = def.dispersion;
  ELEC_COND_LUT[id] = def.elecCond;
  TENSILE_LUT[id] = def.tensileStrength;
  POROSITY_LUT[id] = def.porosity;
  STATE_LUT[id] = ({ empty: 0, solid: 1, powder: 2, liquid: 3, gas: 4, energy: 5, tool: 6 } as Record<string, number>)[def.state] ?? 0;
}

for (const module of ELEMENT_MODULES) bind(module);

/** Установить элемент стороннего мода. Перезапись существующего id запрещена. */
export function installElement(module: ElementModule): number {
  const id = module.def.id;
  if (ELEMENT_BY_ID[id] && ELEMENT_BY_ID[id] !== module) {
    throw new Error(`Элемент #${id} уже занят`);
  }
  bind(module);
  return id;
}

/** Краткая справка по элементу для каталога/подсказок. */
export function describeElement(id: number): string {
  const m = ELEMENT_BY_ID[id];
  if (!m) return '';
  const lines = [m.summary, `Мод: ${m.mod}`, `Состояние: ${m.def.state}`];
  for (const r of m.reactions) lines.push(`· ${r.note}`);
  return lines.join('\n');
}
