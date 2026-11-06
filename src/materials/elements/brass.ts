// Элемент #162 — Латунь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","selectable"],
  summary: "Сплав меди и цинка (8500 кг/м³). Плавится при 930 °C, проводит ток хуже чистой меди.",
  def: {
    id: 162,
    key: "brass",
    name: "Латунь",
    shortDesc: "Сплав меди и цинка (8500 кг/м³). Плавится при 930 °C, проводит ток хуже чистой меди.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 8500,
    specificHeat: 0.38,
    thermalCond: 0.55,
    meltTempC: 930,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.3,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 520,
    elecCond: 0.42,
    elecResistanceHeat: 0.06,
    baseColor: [196,168,78],
    accentColor: [238,214,128],
    metallic: 0.9,
    roughness: 0.3,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":930,"ratePerSecond":4.8,"produce":69},
  ],
  behavior: {

  },

});
