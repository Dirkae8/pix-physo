// Элемент #97 — Серебряный провод. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","electric","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 97,
    key: "silver_wire",
    name: "Серебряный провод",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 10490,
    specificHeat: 0.38,
    thermalCond: 0.95,
    meltTempC: 962,
    meltInto: 142,
    flammability: 0,
    acidResistance: 0.35,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 680,
    elecCond: 0.99,
    elecResistanceHeat: 0.015,
    baseColor: [228,232,237],
    accentColor: [252,176,124],
    metallic: 0.95,
    roughness: 0.2,
    opacity: 1,
    emissive: 0,
    textureStyle: "wire",
  },
  reactions: [
    {"note":"Плавление → #142","trigger":"heat","minTempC":962,"ratePerSecond":4.8,"produce":142},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
