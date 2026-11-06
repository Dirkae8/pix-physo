// Элемент #2 — Дерево. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Массив дуба. Плавает в воде, обугливается в уголь и горит с жаром и дымом.",
  def: {
    id: 2,
    key: "wood",
    name: "Дерево",
    shortDesc: "Массив дуба. Плавает в воде, обугливается в уголь и горит с жаром и дымом.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 680,
    specificHeat: 1.7,
    thermalCond: 0.05,
    flammability: 0.35,
    ignitionTempC: 285,
    burnHeat: 38,
    acidResistance: 0.2,
    porosity: 0.25,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 125,
    elecCond: 0,
    baseColor: [146,98,57],
    accentColor: [102,63,33],
    metallic: 0.02,
    roughness: 0.78,
    opacity: 1,
    emissive: 0,
    textureStyle: "wood",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":285,"ratePerSecond":7.35,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 110,
    burnRatePerSecond: 0.5,
    burnProduct: 74,
  },

});
