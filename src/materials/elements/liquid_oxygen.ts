// Элемент #87 — Жидкий кислород. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 87,
    key: "liquid_oxygen",
    name: "Жидкий кислород",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1141,
    specificHeat: 2.04,
    thermalCond: 0.32,
    defaultTempC: -183,
    boilTempC: -183,
    boilInto: 39,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 12,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [112,167,246],
    accentColor: [238,252,255],
    metallic: 0.08,
    roughness: 0.04,
    opacity: 0.62,
    emissive: 0.12,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #39","trigger":"heat","minTempC":-183,"ratePerSecond":0.11,"produce":39},
  ],
  behavior: {

  },

});
