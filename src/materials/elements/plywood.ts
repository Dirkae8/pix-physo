// Элемент #154 — Фанера. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Слоистый шпон (650 кг/м³). Держит удар лучше массива, но так же обугливается в уголь.",
  def: {
    id: 154,
    key: "plywood",
    name: "Фанера",
    shortDesc: "Слоистый шпон (650 кг/м³). Держит удар лучше массива, но так же обугливается в уголь.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 650,
    specificHeat: 1.6,
    thermalCond: 0.06,
    flammability: 0.38,
    ignitionTempC: 290,
    burnHeat: 40,
    acidResistance: 0.2,
    porosity: 0.22,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 170,
    elecCond: 0,
    baseColor: [190,154,102],
    accentColor: [226,190,136],
    metallic: 0,
    roughness: 0.8,
    opacity: 1,
    emissive: 0,
    textureStyle: "wood",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":290,"ratePerSecond":7.98,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 108,
    sheet: true,
    burnRatePerSecond: 1.4,
    burnProduct: 74,
  },

});
