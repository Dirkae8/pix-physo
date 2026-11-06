// Элемент #75 — Осколки стекла. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular"],
  summary: "Острые стеклянные осколки после разрушения стекла ударной волной или термошоком.",
  def: {
    id: 75,
    key: "glass_shards",
    name: "Осколки стекла",
    shortDesc: "Острые стеклянные осколки после разрушения стекла ударной волной или термошоком.",
    category: "powders",
    state: "powder",
    selectable: false,
    density: 2250,
    specificHeat: 0.8,
    thermalCond: 0.1,
    meltTempC: 1480,
    meltInto: 70,
    flammability: 0,
    acidResistance: 1,
    porosity: 0.15,
    viscosity: 0.3,
    dispersion: 1,
    reposeSkip: 0.28,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [184,232,246],
    accentColor: [244,254,255],
    metallic: 0.22,
    roughness: 0.12,
    opacity: 0.68,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1480,"ratePerSecond":4.8,"produce":70},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 104,
    granular: true,
  },

});
