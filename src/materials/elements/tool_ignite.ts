// Элемент #116 — Поджиг. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","tool","tools","selectable"],
  summary: "Инструмент воздействия на выбранную область.",
  def: {
    id: 116,
    key: "tool_ignite",
    name: "Поджиг",
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
    baseColor: [244,86,30],
    accentColor: [255,224,102],
    metallic: 0.4,
    roughness: 0.3,
    opacity: 1,
    emissive: 0.8,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },

});
