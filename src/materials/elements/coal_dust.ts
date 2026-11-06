// Элемент #179 — Угольная пыль. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Тонкая угольная пыль (750 кг/м³). Быстро тлеет, а во взвеси способна к объёмной вспышке.",
  def: {
    id: 179,
    key: "coal_dust",
    name: "Угольная пыль",
    shortDesc: "Тонкая угольная пыль (750 кг/м³). Быстро тлеет, а во взвеси способна к объёмной вспышке.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 750,
    specificHeat: 1.3,
    thermalCond: 0.05,
    flammability: 0.95,
    ignitionTempC: 220,
    burnHeat: 78,
    acidResistance: 0.4,
    porosity: 0.35,
    viscosity: 0.3,
    dispersion: 5,
    reposeSkip: 0.18,
    tensileStrength: 0,
    elecCond: 0.08,
    baseColor: [38,38,40],
    accentColor: [86,86,90],
    metallic: 0,
    roughness: 0.94,
    opacity: 1,
    emissive: 0,
    textureStyle: "coal",
    explosivePower: 0.55,
    detonationShockKPa: 26,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":220,"ratePerSecond":19.95,"produce":62},
    {"note":"Детонация, мощность 0.55","trigger":"shock","minTempC":220,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 116,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 0.5,
  },

});
