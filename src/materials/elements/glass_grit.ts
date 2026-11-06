// Элемент #175 — Стеклянная крошка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Дроблёное стекло (2500 кг/м³). Сыпучий абразив, при 1500 °C снова плавится в стекломассу.",
  def: {
    id: 175,
    key: "glass_grit",
    name: "Стеклянная крошка",
    shortDesc: "Дроблёное стекло (2500 кг/м³). Сыпучий абразив, при 1500 °C снова плавится в стекломассу.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2500,
    specificHeat: 0.8,
    thermalCond: 0.09,
    meltTempC: 1500,
    meltInto: 70,
    flammability: 0,
    acidResistance: 1,
    porosity: 0.1,
    viscosity: 0.2,
    dispersion: 5,
    reposeSkip: 0.15,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [176,214,224],
    accentColor: [222,244,252],
    metallic: 0.1,
    roughness: 0.2,
    opacity: 0.9,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1500,"ratePerSecond":4.8,"produce":70},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 101,
    granular: true,
  },

});
