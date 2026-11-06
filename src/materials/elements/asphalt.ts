// Элемент #164 — Асфальт. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","selectable"],
  summary: "Битум с минеральным наполнителем (2300 кг/м³). Размягчается на жаре, тлеет при 400 °C.",
  def: {
    id: 164,
    key: "asphalt",
    name: "Асфальт",
    shortDesc: "Битум с минеральным наполнителем (2300 кг/м³). Размягчается на жаре, тлеет при 400 °C.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2300,
    specificHeat: 0.92,
    thermalCond: 0.06,
    meltTempC: 110,
    meltInto: 245,
    flammability: 0.32,
    acidResistance: 0.7,
    porosity: 0.04,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 180,
    elecCond: 0,
    baseColor: [52,54,56],
    accentColor: [96,98,100],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "concrete",
    ignitionTempC: 400,
    burnHeat: 48,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":110,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":400,"ratePerSecond":6.72,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 97,
    burnRatePerSecond: 10.5,
  },

});
