// Элемент #67 — Импульс ветра. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","tool","tools","selectable"],
  summary: "Двигайте кистью, чтобы напрямую закручивать вихри воздуха, волны давления и разбрасывать жидкости.",
  def: {
    id: 67,
    key: "tool_wind",
    name: "Импульс ветра",
    shortDesc: "Двигайте кистью, чтобы напрямую закручивать вихри воздуха, волны давления и разбрасывать жидкости.",
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
    baseColor: [52,211,153],
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
