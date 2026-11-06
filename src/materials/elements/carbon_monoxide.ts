// Элемент #203 — Угарный газ. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "CO (1,25 кг/м³). Горючий ядовитый газ неполного сгорания, почти как воздух по плотности.",
  def: {
    id: 203,
    key: "carbon_monoxide",
    name: "Угарный газ",
    shortDesc: "CO (1,25 кг/м³). Горючий ядовитый газ неполного сгорания, почти как воздух по плотности.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.25,
    specificHeat: 1.04,
    thermalCond: 0.04,
    flammability: 0.85,
    ignitionTempC: 610,
    burnHeat: 62,
    explosivePower: 0.68,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [160,166,172],
    accentColor: [210,216,220],
    metallic: 0,
    roughness: 1,
    opacity: 0.3,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":610,"ratePerSecond":17.849999999999998,"produce":62},
    {"note":"Детонация, мощность 0.68","trigger":"shock","minTempC":610,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
