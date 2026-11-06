// Элемент #213 — Биогаз. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "Смесь CH₄ и CO₂ (1,2 кг/м³). Горюч, легче воздуха, скапливается под перекрытием.",
  def: {
    id: 213,
    key: "biogas",
    name: "Биогаз",
    shortDesc: "Смесь CH₄ и CO₂ (1,2 кг/м³). Горюч, легче воздуха, скапливается под перекрытием.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.2,
    specificHeat: 1.9,
    thermalCond: 0.05,
    flammability: 0.82,
    ignitionTempC: 260,
    burnHeat: 72,
    explosivePower: 0.55,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [160,206,158],
    accentColor: [210,238,204],
    metallic: 0,
    roughness: 1,
    opacity: 0.34,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":260,"ratePerSecond":17.22,"produce":62},
    {"note":"Детонация, мощность 0.55","trigger":"shock","minTempC":260,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
