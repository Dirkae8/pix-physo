// Элемент #96 — Аммиак. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 96,
    key: "ammonia",
    name: "Аммиак",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.73,
    specificHeat: 1.05,
    thermalCond: 0.05,
    defaultTempC: 85,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.04,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [205,217,198],
    accentColor: [132,138,148],
    metallic: 0,
    roughness: 1,
    opacity: 0.52,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
