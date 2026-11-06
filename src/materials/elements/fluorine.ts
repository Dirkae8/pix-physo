// Элемент #95 — Фтор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 95,
    key: "fluorine",
    name: "Фтор",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.7,
    specificHeat: 0.48,
    thermalCond: 0.04,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.04,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [215,234,108],
    accentColor: [212,248,128],
    metallic: 0,
    roughness: 1,
    opacity: 0.46,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
