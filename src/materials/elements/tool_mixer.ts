// Элемент #114 — Смеситель. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","tool","tools","selectable"],
  summary: "Инструмент воздействия на выбранную область.",
  def: {
    id: 114,
    key: "tool_mixer",
    name: "Смеситель",
    shortDesc: "Инструмент воздействия на выбранную область.",
    category: "tools",
    state: "tool",
    selectable: true,
    density: 0,
    specificHeat: 1,
    thermalCond: 0,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 0,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [112,220,185],
    accentColor: [209,250,229],
    metallic: 0.2,
    roughness: 0.4,
    opacity: 1,
    emissive: 0.3,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },

});
