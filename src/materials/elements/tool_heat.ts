// Элемент #65 — Нагрев (Лазер). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","tool","tools","selectable"],
  summary: "Интенсивный бесконтактный нагрев вещества до 4500 °C без добавления лишних частиц.",
  def: {
    id: 65,
    key: "tool_heat",
    name: "Нагрев (Лазер)",
    shortDesc: "Интенсивный бесконтактный нагрев вещества до 4500 °C без добавления лишних частиц.",
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
    baseColor: [248,82,42],
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
