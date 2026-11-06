// Элемент #115 — Криоимпульс. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","tool","tools","selectable"],
  summary: "Инструмент воздействия на выбранную область.",
  def: {
    id: 115,
    key: "tool_cryo",
    name: "Криоимпульс",
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
    baseColor: [118,218,255],
    accentColor: [224,248,255],
    metallic: 0.4,
    roughness: 0.3,
    opacity: 1,
    emissive: 0.6,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },

});
