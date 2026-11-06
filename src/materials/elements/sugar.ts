// Элемент #16 — Сахар. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Сахароза. Растворяется в воде в сироп, карамелизуется и вспучивается углём от жара и кислоты!",
  def: {
    id: 16,
    key: "sugar",
    name: "Сахар",
    shortDesc: "Сахароза. Растворяется в воде в сироп, карамелизуется и вспучивается углём от жара и кислоты!",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1590,
    specificHeat: 1.24,
    thermalCond: 0.06,
    flammability: 0.42,
    ignitionTempC: 215,
    burnHeat: 35,
    acidResistance: 0.05,
    porosity: 0.28,
    waterSoluble: true,
    viscosity: 0.28,
    dispersion: 1,
    reposeSkip: 0.24,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [245,238,222],
    accentColor: [224,210,184],
    metallic: 0.14,
    roughness: 0.34,
    opacity: 0.96,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":215,"ratePerSecond":8.82,"produce":62},
    {"note":"Растворение в воде","trigger":"wet","with":[24],"ratePerSecond":2.7,"produce":71},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 112,
    granular: true,
    burnRatePerSecond: 10.5,
    burnProduct: 74,
  },

});
