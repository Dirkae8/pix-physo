// Элемент #66 — Охлаждение. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","tool","tools","selectable"],
  summary: "Криогенный отвод тепла вплоть до -270 °C (почти абсолютный ноль 3 К).",
  def: {
    id: 66,
    key: "tool_cool",
    name: "Охлаждение",
    shortDesc: "Криогенный отвод тепла вплоть до -270 °C (почти абсолютный ноль 3 К).",
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
    baseColor: [56,189,248],
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
