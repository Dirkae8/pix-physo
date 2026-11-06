// Элемент #168 — Мука. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Пшеничная мука (600 кг/м³). Взвесь пыли горюча, в воде набухает в клейстер.",
  def: {
    id: 168,
    key: "flour",
    name: "Мука",
    shortDesc: "Пшеничная мука (600 кг/м³). Взвесь пыли горюча, в воде набухает в клейстер.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 600,
    specificHeat: 1.6,
    thermalCond: 0.035,
    flammability: 0.78,
    ignitionTempC: 380,
    burnHeat: 30,
    acidResistance: 0.1,
    porosity: 0.55,
    viscosity: 0.4,
    dispersion: 3,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [238,230,210],
    accentColor: [252,246,232],
    metallic: 0,
    roughness: 0.96,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":380,"ratePerSecond":16.38,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 128,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
