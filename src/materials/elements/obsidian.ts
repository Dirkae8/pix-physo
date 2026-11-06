// Элемент #82 — Обсидиан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 82,
    key: "obsidian",
    name: "Обсидиан",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2400,
    specificHeat: 0.8,
    thermalCond: 0.11,
    meltTempC: 1520,
    meltInto: 70,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 38,
    elecCond: 0,
    baseColor: [47,35,62],
    accentColor: [238,252,255],
    metallic: 0.15,
    roughness: 0.06,
    opacity: 0.48,
    emissive: 0,
    textureStyle: "glass",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1520,"ratePerSecond":4.8,"produce":70},
  ],
  behavior: {

  },

});
