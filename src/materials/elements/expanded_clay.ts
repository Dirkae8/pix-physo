// Элемент #180 — Керамзит. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Вспученная глина (600 кг/м³). Лёгкие пористые гранулы плавают и удерживают влагу.",
  def: {
    id: 180,
    key: "expanded_clay",
    name: "Керамзит",
    shortDesc: "Вспученная глина (600 кг/м³). Лёгкие пористые гранулы плавают и удерживают влагу.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 600,
    specificHeat: 0.95,
    thermalCond: 0.025,
    flammability: 0,
    ignitionTempC: 580,
    acidResistance: 0.85,
    porosity: 0.8,
    viscosity: 0.35,
    dispersion: 4,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [146,106,78],
    accentColor: [188,146,112],
    metallic: 0,
    roughness: 0.96,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 110,
    granular: true,
  },

});
