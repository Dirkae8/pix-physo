// Элемент #80 — Гранит. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 80,
    key: "granite",
    name: "Гранит",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2700,
    specificHeat: 0.88,
    thermalCond: 0.16,
    meltTempC: 1580,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.4,
    porosity: 0.08,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 620,
    elecCond: 0,
    baseColor: [125,119,118],
    accentColor: [164,168,170],
    metallic: 0.04,
    roughness: 0.92,
    opacity: 1,
    emissive: 0,
    textureStyle: "concrete",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":1580,"ratePerSecond":4.8,"produce":26},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 100,
  },

});
