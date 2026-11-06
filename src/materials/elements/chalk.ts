// Элемент #241 — Мел. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","powders","granular","selectable"],
  summary: "Природный мел CaCO₃ (2500 кг/м³). Шипит в кислоте, оставляет белую пыль.",
  def: {
    id: 241,
    key: "chalk",
    name: "Мел",
    shortDesc: "Природный мел CaCO₃ (2500 кг/м³). Шипит в кислоте, оставляет белую пыль.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2500,
    specificHeat: 0.85,
    thermalCond: 0.07,
    flammability: 0,
    acidResistance: 0.05,
    porosity: 0.35,
    waterSoluble: true,
    viscosity: 0.3,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [240,240,234],
    accentColor: [255,255,250],
    metallic: 0,
    roughness: 0.95,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Растворение в воде","trigger":"wet","with":[24],"ratePerSecond":2.7,"produce":71},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 116,
    carbonate: true,
    granular: true,
  },

});
