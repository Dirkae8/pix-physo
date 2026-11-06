// Элемент #68 — Ластик. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","tool","tools","selectable"],
  summary: "Очищает выбранную область от любых веществ и конструкций (также работает на ПКМ).",
  def: {
    id: 68,
    key: "tool_eraser",
    name: "Ластик",
    shortDesc: "Очищает выбранную область от любых веществ и конструкций (также работает на ПКМ).",
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
    baseColor: [148,163,184],
    accentColor: [244,63,94],
    metallic: 0.1,
    roughness: 0.6,
    opacity: 1,
    emissive: 0,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },

});
