// Элемент #92 — Гелий. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 92,
    key: "helium",
    name: "Гелий",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.18,
    specificHeat: 14.3,
    thermalCond: 0.32,
    flammability: 0,
    burnHeat: 95,
    explosivePower: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [228,200,242],
    accentColor: [195,228,255],
    metallic: 0,
    roughness: 1,
    opacity: 0.34,
    emissive: 0.08,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
