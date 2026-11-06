// Элемент #88 — Перекись водорода. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 88,
    key: "peroxide",
    name: "Перекись водорода",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1110,
    specificHeat: 4.18,
    thermalCond: 0.22,
    boilTempC: 100,
    boilInto: 40,
    freezeTempC: 0,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.04,
    dispersion: 11,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.08,
    baseColor: [181,215,227],
    accentColor: [128,202,255],
    metallic: 0.12,
    roughness: 0.05,
    opacity: 0.72,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #40","trigger":"heat","minTempC":100,"ratePerSecond":0.11,"produce":40},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":0,"produce":7},
  ],
  behavior: {

  },

});
