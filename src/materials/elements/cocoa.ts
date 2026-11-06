// Элемент #170 — Какао-порошок. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Обезжиренное какао (450 кг/м³). Лёгкая органическая пыль, смачивается водой и молоком.",
  def: {
    id: 170,
    key: "cocoa",
    name: "Какао-порошок",
    shortDesc: "Обезжиренное какао (450 кг/м³). Лёгкая органическая пыль, смачивается водой и молоком.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 450,
    specificHeat: 1.6,
    thermalCond: 0.03,
    flammability: 0.7,
    ignitionTempC: 350,
    burnHeat: 28,
    acidResistance: 0.1,
    porosity: 0.6,
    viscosity: 0.4,
    dispersion: 3,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [94,58,38],
    accentColor: [148,96,62],
    metallic: 0,
    roughness: 0.96,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":350,"ratePerSecond":14.7,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 131,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
