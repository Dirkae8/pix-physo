// Элемент #91 — Азот. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 91,
    key: "nitrogen",
    name: "Азот",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.25,
    specificHeat: 0.92,
    thermalCond: 0.06,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [160,180,196],
    accentColor: [164,218,255],
    metallic: 0,
    roughness: 1,
    opacity: 0.32,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
