// Элемент #240 — Базальтовая плита. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","solids","sheet","selectable"],
  summary: "Вулканическая порода (2900 кг/м³). Туго плавится при 1200 °C и держит ударную волну.",
  def: {
    id: 240,
    key: "basalt_slab",
    name: "Базальтовая плита",
    shortDesc: "Вулканическая порода (2900 кг/м³). Туго плавится при 1200 °C и держит ударную волну.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2900,
    specificHeat: 0.84,
    thermalCond: 0.16,
    meltTempC: 1200,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.95,
    porosity: 0.02,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 480,
    elecCond: 0,
    baseColor: [72,74,78],
    accentColor: [122,126,132],
    metallic: 0.05,
    roughness: 0.88,
    opacity: 1,
    emissive: 0,
    textureStyle: "concrete",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":1200,"ratePerSecond":4.8,"produce":26},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 96,
    sheet: true,
  },

});
