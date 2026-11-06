// Элемент #177 — Гипс. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "CaSO₄·2H₂O (2300 кг/м³). Затворяется водой и твердеет, как цемент, но быстрее.",
  def: {
    id: 177,
    key: "gypsum",
    name: "Гипс",
    shortDesc: "CaSO₄·2H₂O (2300 кг/м³). Затворяется водой и твердеет, как цемент, но быстрее.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2300,
    specificHeat: 1.09,
    thermalCond: 0.06,
    flammability: 0,
    acidResistance: 0.25,
    porosity: 0.4,
    viscosity: 0.3,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [232,228,216],
    accentColor: [250,248,238],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 119,
    granular: true,
  },

});
