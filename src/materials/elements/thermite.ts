// Элемент #58 — Термит. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","explosives","granular","selectable"],
  summary: "Смесь Fe₂O₃ + Al. Горит даже под водой при 2500 °C, прожигая стальную броню насквозь жидким железом!",
  def: {
    id: 58,
    key: "thermite",
    name: "Термит",
    shortDesc: "Смесь Fe₂O₃ + Al. Горит даже под водой при 2500 °C, прожигая стальную броню насквозь жидким железом!",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 3100,
    specificHeat: 0.72,
    thermalCond: 0.28,
    flammability: 0.35,
    ignitionTempC: 680,
    burnHeat: 240,
    acidResistance: 0.4,
    porosity: 0.15,
    viscosity: 0.35,
    dispersion: 1,
    reposeSkip: 0.28,
    tensileStrength: 0,
    elecCond: 0.35,
    baseColor: [148,72,58],
    accentColor: [204,210,218],
    metallic: 0.55,
    roughness: 0.48,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":680,"ratePerSecond":7.35,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 104,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
