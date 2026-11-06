import type { MaterialDef } from '../types/physics';

/**
 * Публичный API элемента PIXPHYSO.
 *
 * Каждое вещество живёт в собственном файле `src/materials/elements/<key>.ts`.
 * Файл содержит полные характеристики (`def`), список реакций, поведение и
 * — при необходимости — исполняемые хуки. Движок не знает о конкретных
 * веществах: он читает плоские таблицы из `elementRegistry.ts`.
 * Сторонний мод может добавить новый файл элемента и зарегистрировать его
 * через `registerElement()` из `src/mods/index.ts`.
 */

/** Минимальный структурный вид мира, доступный хукам (без циклического импорта). */
export interface ElementWorldView {
  width: number;
  height: number;
  size: number;
  dtSeconds: number;
  timeSec: number;
  mat: Uint8Array;
  temp: Float32Array;
  wetness: Uint8Array;
  absorbedMat: Uint8Array;
  meta: Uint8Array;
  stress: Float32Array;
  volt: Float32Array;
  current: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  airPressure: Float32Array;
  /** Плоские таблицы состояний и прочности для хуков без обращения к реестру. */
  stateLut: Uint8Array;
  tensileLut: Float32Array;
  env: { ambientTempC: number; pressureKPa: number; humidity: number };
  events: {
    explosionEnergy: number;
    electricArcCount: number;
    sizzleCount: number;
    fractureCount: number;
    fanActiveCount: number;
  };
  rand(): number;
  randByte(): number;
  airIdxFromCell(x: number, y: number): number;
  setCell(x: number, y: number, matId: number, tempC?: number): void;
  fractureCell(i: number, dx: number, dy: number, dist: number, impulse: number): void;
  addImpulseExplosion(x: number, y: number, radius: number, power: number, peakTempC: number): void;
}

export type ElementStepHook = (world: ElementWorldView, i: number, x: number, y: number, dt: number) => void;
export type ElementVoltageHook = (world: ElementWorldView, i: number, x: number, y: number, dt: number) => number;
export type ElementBrushFn = (x: number, y: number, falloff: number) => void;
export type ElementBrushHook = (
  world: ElementWorldView,
  cx: number,
  cy: number,
  radius: number,
  forEach: (cx: number, cy: number, r: number, fn: ElementBrushFn) => void
) => void;

export type ReactionTrigger = 'heat' | 'contact' | 'shock' | 'electric' | 'wet' | 'step' | 'ignite';

/** Декларативная реакция. Исполняющие хуки читают эти данные или реализуют особую логику. */
export interface ElementReaction {
  trigger: ReactionTrigger;
  /** id веществ-партнёров; пусто = любое окружение. */
  with?: number[];
  minTempC?: number;
  /** Интенсивность в 1/секунду реального времени, а не «вероятность за кадр». */
  ratePerSecond?: number;
  /** Результат в самой ячейке. */
  produce?: number;
  /** Результат в клетке-партнёре. */
  producePartner?: number;
  heatDeltaC?: number;
  pressureDeltaKPa?: number;
  note: string;
}

export interface ElementBehavior {
  /** Пористость и сила капиллярного всасывания (0..255). */
  capillary?: number;
  /** Жидкость может быть впитана пористым телом. */
  absorbable?: boolean;
  /** Гасит открытое пламя (водные растворы, туман, CO₂). */
  smothers?: boolean;
  /** Водный раствор: большая скрытая теплота парообразования. */
  aqueous?: boolean;
  /** Карбонат: шипит в кислоте с выделением CO₂. */
  carbonate?: boolean;
  /** Содержит собственный окислитель (пороха, ВВ). */
  selfOxidizer?: boolean;
  /** Интенсивность выгорания в 1/секунду. */
  burnRatePerSecond?: number;
  /** Продукт выгорания: пепел/дым/уголь. */
  burnProduct?: number;
  /** Цвет пламени: 0 — обычный, 1 — синий, 2 — белый. */
  flameColor?: 0 | 1 | 2;
  /** Истинно сыпучее вещество (для аудита категорий). */
  granular?: boolean;
  /** Тонкий листовой/волокнистый материал, а не монолит. */
  sheet?: boolean;
  /** Дым продукта горения: рассеивается как обычный дым. */
  fume?: boolean;
}

export interface ElementModule {
  /** Идентификатор мода-владельца (см. `src/mods`). */
  mod: string;
  /** Ключевые слова для поиска и аудита. */
  tags: string[];
  /** Человекочитаемое пояснение «что это». */
  summary: string;
  /** Полные физические характеристики. */
  def: MaterialDef;
  /** Декларативные реакции вещества. */
  reactions: ElementReaction[];
  /** Табличное поведение, которое читают решатели. */
  behavior: ElementBehavior;
  /** Произвольная логика, выполняемая раз в такт для активной клетки. */
  onStep?: ElementStepHook;
  /** Генератор напряжения (пьезоэлемент, термопара, солнечная панель). */
  onVoltage?: ElementVoltageHook;
  /** Инструмент: эффект кисти. */
  onBrush?: ElementBrushHook;
}

export function defineElement(module: ElementModule): ElementModule {
  return module;
}

/** Перевод скорости реакции (1/с) в вероятность за фиксированный такт. */
export function chancePerTick(ratePerSecond: number, dtSeconds: number): number {
  if (ratePerSecond <= 0) return 0;
  const x = ratePerSecond * dtSeconds;
  return x >= 6 ? 1 : 1 - Math.exp(-x);
}
