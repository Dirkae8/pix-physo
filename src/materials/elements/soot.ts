// Элемент #140 — Сажа. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular","selectable"],
  summary: "Углеродистый остаток неполного горения.",
  def: {
    id: 140,
    key: "soot",
    name: "Сажа",
    shortDesc: "Углеродистый остаток неполного горения.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1400,
    specificHeat: 0.83,
    thermalCond: 0.09,
    meltTempC: 1710,
    meltInto: 70,
    flammability: 0,
    acidResistance: 0.96,
    porosity: 0.38,
    viscosity: 0.3,
    dispersion: 1,
    reposeSkip: 0.18,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [38,38,38],
    accentColor: [242,218,162],
    metallic: 0.08,
    roughness: 0.72,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1710,"ratePerSecond":4.8,"produce":70},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 118,
    granular: true,
  },

});
