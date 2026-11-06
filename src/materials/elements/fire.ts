// Элемент #62 — Огонь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","energy","tools","selectable"],
  summary: "Пламя (950 °C). Поднимается в конвективном потоке, потребляет кислород и поджигает топливо.",
  def: {
    id: 62,
    key: "fire",
    name: "Огонь",
    shortDesc: "Пламя (950 °C). Поднимается в конвективном потоке, потребляет кислород и поджигает топливо.",
    category: "tools",
    state: "energy",
    selectable: true,
    density: 0.28,
    specificHeat: 1.1,
    thermalCond: 0.35,
    defaultTempC: 960,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 5,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.12,
    baseColor: [255,118,24],
    accentColor: [255,238,112],
    metallic: 0,
    roughness: 1,
    opacity: 0.92,
    emissive: 1.65,
    textureStyle: "plasma",
  },
  reactions: [

  ],
  behavior: {

  },

});
