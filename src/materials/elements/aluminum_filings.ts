// Элемент #173 — Алюминиевая стружка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Тонкая стружка Al (2700 кг/м³). Плавает в ртути, горит ослепительно белым пламенем при 660 °C.",
  def: {
    id: 173,
    key: "aluminum_filings",
    name: "Алюминиевая стружка",
    shortDesc: "Тонкая стружка Al (2700 кг/м³). Плавает в ртути, горит ослепительно белым пламенем при 660 °C.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2700,
    specificHeat: 0.9,
    thermalCond: 0.7,
    meltTempC: 660,
    meltInto: 118,
    flammability: 0.8,
    ignitionTempC: 560,
    burnHeat: 150,
    acidResistance: 0.2,
    porosity: 0.1,
    viscosity: 0.25,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0.6,
    baseColor: [194,200,206],
    accentColor: [236,242,248],
    metallic: 0.9,
    roughness: 0.4,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #118","trigger":"heat","minTempC":660,"ratePerSecond":4.8,"produce":118},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":560,"ratePerSecond":16.8,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    capillary: 101,
    granular: true,
    burnRatePerSecond: 10.5,
    flameColor: 2,
  },

});
