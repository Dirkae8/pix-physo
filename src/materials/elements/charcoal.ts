// Элемент #74 — Древесный уголь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular"],
  summary: "Пористый углерод от обугливания дерева или сахара. Долго тлеет с красным жаром.",
  def: {
    id: 74,
    key: "charcoal",
    name: "Древесный уголь",
    shortDesc: "Пористый углерод от обугливания дерева или сахара. Долго тлеет с красным жаром.",
    category: "powders",
    state: "powder",
    selectable: false,
    density: 520,
    specificHeat: 1,
    thermalCond: 0.08,
    flammability: 0.3,
    ignitionTempC: 340,
    burnHeat: 58,
    acidResistance: 0.92,
    porosity: 0.6,
    viscosity: 0.45,
    dispersion: 1,
    reposeSkip: 0.48,
    tensileStrength: 0,
    elecCond: 0.16,
    baseColor: [30,31,34],
    accentColor: [212,74,28],
    metallic: 0.05,
    roughness: 0.95,
    opacity: 1,
    emissive: 0,
    textureStyle: "coal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":340,"ratePerSecond":6.3,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 131,
    granular: true,
    burnRatePerSecond: 0.5,
  },

});
