// Элемент #169 — Крахмал. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Крахмал (650 кг/м³). Растворяется в воде, при нагреве загустевает в крахмальный клейстер.",
  def: {
    id: 169,
    key: "starch",
    name: "Крахмал",
    shortDesc: "Крахмал (650 кг/м³). Растворяется в воде, при нагреве загустевает в крахмальный клейстер.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 650,
    specificHeat: 1.5,
    thermalCond: 0.035,
    flammability: 0.62,
    ignitionTempC: 370,
    burnHeat: 26,
    acidResistance: 0.15,
    porosity: 0.5,
    waterSoluble: true,
    viscosity: 0.45,
    dispersion: 3,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [246,244,236],
    accentColor: [255,254,248],
    metallic: 0,
    roughness: 0.94,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":370,"ratePerSecond":13.02,"produce":62},
    {"note":"Растворение в воде","trigger":"wet","with":[24],"ratePerSecond":2.7,"produce":71},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 125,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
