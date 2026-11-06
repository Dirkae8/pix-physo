// Элемент #207 — Этилен. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "C₂H₄ (1,18 кг/м³). Горючий газ созревания плодов, почти нейтральной плавучести.",
  def: {
    id: 207,
    key: "ethylene",
    name: "Этилен",
    shortDesc: "C₂H₄ (1,18 кг/м³). Горючий газ созревания плодов, почти нейтральной плавучести.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.18,
    specificHeat: 1.53,
    thermalCond: 0.04,
    flammability: 0.9,
    ignitionTempC: 450,
    burnHeat: 88,
    explosivePower: 0.68,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [206,220,214],
    accentColor: [238,248,242],
    metallic: 0,
    roughness: 1,
    opacity: 0.3,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":450,"ratePerSecond":18.900000000000002,"produce":62},
    {"note":"Детонация, мощность 0.68","trigger":"shock","minTempC":450,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
