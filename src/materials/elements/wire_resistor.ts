// Элемент #224 — Проволочный резистор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Керамический каркас с обмоткой. Ограничивает ток и выделяет тепло по закону Джоуля–Ленца.",
  def: {
    id: 224,
    key: "wire_resistor",
    name: "Проволочный резистор",
    shortDesc: "Керамический каркас с обмоткой. Ограничивает ток и выделяет тепло по закону Джоуля–Ленца.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 3100,
    specificHeat: 0.85,
    thermalCond: 0.12,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 90,
    elecCond: 0.18,
    elecResistanceHeat: 2.4,
    baseColor: [192,176,140],
    accentColor: [232,218,184],
    metallic: 0.1,
    roughness: 0.65,
    opacity: 1,
    emissive: 0,
    textureStyle: "heater",
  },
  reactions: [

  ],
  behavior: {

  },

});
