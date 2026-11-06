// Элемент #90 — Морская вода. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 90,
    key: "seawater",
    name: "Морская вода",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1025,
    specificHeat: 3.95,
    thermalCond: 0.24,
    boilTempC: 104,
    boilInto: 40,
    freezeTempC: -12,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.05,
    dispersion: 11,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.78,
    baseColor: [31,139,177],
    accentColor: [148,224,255],
    metallic: 0.14,
    roughness: 0.05,
    opacity: 0.76,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #40","trigger":"heat","minTempC":104,"ratePerSecond":0.11,"produce":40},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-12,"produce":7},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
  },

});
