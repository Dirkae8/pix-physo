// Элемент #193 — Керосин. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Керосин (800 кг/м³). Классическое топливо для фитиля: капиллярный подсос и ровное пламя.",
  def: {
    id: 193,
    key: "kerosene",
    name: "Керосин",
    shortDesc: "Керосин (800 кг/м³). Классическое топливо для фитиля: капиллярный подсос и ровное пламя.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 800,
    specificHeat: 2,
    thermalCond: 0.08,
    boilTempC: 200,
    boilInto: 247,
    flammability: 0.92,
    ignitionTempC: 220,
    burnHeat: 110,
    explosivePower: 0.35,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.12,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [206,196,142],
    accentColor: [240,232,186],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.78,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #247","trigger":"heat","minTempC":200,"ratePerSecond":8,"produce":247},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":220,"ratePerSecond":19.32,"produce":62},
    {"note":"Детонация, мощность 0.35","trigger":"shock","minTempC":220,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
