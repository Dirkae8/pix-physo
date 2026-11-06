// Элемент #73 — Базальт. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids"],
  summary: "Тёмная вулканическая порода, образовавшаяся при остывании лавы.",
  def: {
    id: 73,
    key: "basalt",
    name: "Базальт",
    shortDesc: "Тёмная вулканическая порода, образовавшаяся при остывании лавы.",
    category: "solids",
    state: "solid",
    selectable: false,
    density: 2920,
    specificHeat: 0.84,
    thermalCond: 0.18,
    meltTempC: 1120,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.88,
    porosity: 0.04,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 540,
    elecCond: 0,
    baseColor: [52,54,60],
    accentColor: [84,88,96],
    metallic: 0.08,
    roughness: 0.88,
    opacity: 1,
    emissive: 0,
    textureStyle: "concrete",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":1120,"ratePerSecond":4.8,"produce":26},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 97,
  },

});
