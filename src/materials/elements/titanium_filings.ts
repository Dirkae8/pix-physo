// Элемент #174 — Титановая стружка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Титановая стружка (4506 кг/м³). Тонет в воде, но всплывает в ртути; горит ярко-белым при 610 °C.",
  def: {
    id: 174,
    key: "titanium_filings",
    name: "Титановая стружка",
    shortDesc: "Титановая стружка (4506 кг/м³). Тонет в воде, но всплывает в ртути; горит ярко-белым при 610 °C.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 4506,
    specificHeat: 0.52,
    thermalCond: 0.28,
    meltTempC: 1668,
    meltInto: 121,
    flammability: 0.72,
    ignitionTempC: 610,
    burnHeat: 135,
    acidResistance: 0.98,
    porosity: 0.1,
    viscosity: 0.25,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0.42,
    baseColor: [150,158,168],
    accentColor: [206,216,226],
    metallic: 0.9,
    roughness: 0.42,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #121","trigger":"heat","minTempC":1668,"ratePerSecond":4.8,"produce":121},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":610,"ratePerSecond":15.12,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 101,
    granular: true,
    burnRatePerSecond: 10.5,
    flameColor: 2,
  },

});
