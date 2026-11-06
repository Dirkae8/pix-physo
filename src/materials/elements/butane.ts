// Элемент #206 — Бутан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "C₄H₁₀ (2,48 кг/м³). Тяжелее воздуха: стелется по полу и скапливается у источников огня.",
  def: {
    id: 206,
    key: "butane",
    name: "Бутан",
    shortDesc: "C₄H₁₀ (2,48 кг/м³). Тяжелее воздуха: стелется по полу и скапливается у источников огня.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 2.48,
    specificHeat: 1.7,
    thermalCond: 0.04,
    flammability: 0.95,
    ignitionTempC: 405,
    burnHeat: 96,
    explosivePower: 0.62,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [216,190,140],
    accentColor: [242,222,178],
    metallic: 0,
    roughness: 1,
    opacity: 0.4,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":405,"ratePerSecond":19.95,"produce":62},
    {"note":"Детонация, мощность 0.62","trigger":"shock","minTempC":405,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
