// Элемент #248 — Пары растворителя. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","gas","gases"],
  summary: "Летучие пары ацетона и ароматики: тяжелее воздуха, легко вспыхивают.",
  def: {
    id: 248,
    key: "solvent_vapor",
    name: "Пары растворителя",
    shortDesc: "Летучие пары ацетона и ароматики: тяжелее воздуха, легко вспыхивают.",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 2.4,
    specificHeat: 1.5,
    thermalCond: 0.04,
    freezeTempC: 50,
    freezeInto: 194,
    flammability: 0.95,
    ignitionTempC: 420,
    burnHeat: 96,
    acidResistance: 0.8,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [204,216,224],
    accentColor: [236,246,252],
    metallic: 0,
    roughness: 1,
    opacity: 0.36,
    emissive: 0,
    textureStyle: "gas",
    defaultTempC: 70,
  },
  reactions: [
    {"note":"Затвердевание → #194","trigger":"heat","minTempC":50,"produce":194},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":420,"ratePerSecond":19.95,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
