// Элемент #41 — Дым. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Тёплый аэрозоль копоти. Поднимается конвекцией, сносится ветром и вентиляторами.",
  def: {
    id: 41,
    key: "smoke",
    name: "Дым",
    shortDesc: "Тёплый аэрозоль копоти. Поднимается конвекцией, сносится ветром и вентиляторами.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.85,
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
    baseColor: [84,88,96],
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
