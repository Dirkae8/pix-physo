// Элемент #123 — Сухой лёд. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids","selectable"],
  summary: "Медленно сублимирует в углекислый газ при нагреве выше −78 °C.",
  def: {
    id: 123,
    key: "dry_ice",
    name: "Сухой лёд",
    shortDesc: "Медленно сублимирует в углекислый газ при нагреве выше −78 °C.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1560,
    specificHeat: 2.05,
    thermalCond: 0.24,
    defaultTempC: -80,
    flammability: 0,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 55,
    elecCond: 0,
    baseColor: [220,230,230],
    accentColor: [232,248,255],
    metallic: 0.1,
    roughness: 0.14,
    opacity: 0.78,
    emissive: 0,
    textureStyle: "ice",
  },
  reactions: [

  ],
  behavior: {

  },

});
