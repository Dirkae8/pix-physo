// Элемент #126 — Ржавчина. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular"],
  summary: "Медленный продукт окисления железа и стали при влажности.",
  def: {
    id: 126,
    key: "rust",
    name: "Ржавчина",
    shortDesc: "Медленный продукт окисления железа и стали при влажности.",
    category: "powders",
    state: "powder",
    selectable: false,
    density: 5200,
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
    baseColor: [137,73,40],
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
