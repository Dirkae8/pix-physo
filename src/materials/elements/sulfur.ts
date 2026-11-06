// Элемент #83 — Сера. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 83,
    key: "sulfur",
    name: "Сера",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2070,
    specificHeat: 0.83,
    thermalCond: 0.09,
    meltTempC: 1710,
    meltInto: 70,
    flammability: 0.7,
    acidResistance: 0.96,
    porosity: 0.38,
    viscosity: 0.3,
    dispersion: 1,
    reposeSkip: 0.18,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [234,213,48],
    accentColor: [242,218,162],
    metallic: 0.08,
    roughness: 0.72,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
    ignitionTempC: 235,
    burnHeat: 45,
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1710,"ratePerSecond":4.8,"produce":70},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":235,"ratePerSecond":14.7,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 118,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
