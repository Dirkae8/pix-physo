// Элемент #8 — Губка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Пористый материал с мощным капиллярным впитыванием воды, масел и спирта.",
  def: {
    id: 8,
    key: "sponge",
    name: "Губка",
    shortDesc: "Пористый материал с мощным капиллярным впитыванием воды, масел и спирта.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 260,
    specificHeat: 1.4,
    thermalCond: 0.04,
    flammability: 0.45,
    ignitionTempC: 240,
    burnHeat: 28,
    acidResistance: 0.15,
    porosity: 0.95,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 75,
    elecCond: 0,
    baseColor: [216,178,64],
    accentColor: [158,122,30],
    metallic: 0,
    roughness: 0.95,
    opacity: 1,
    emissive: 0,
    textureStyle: "sponge",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":240,"ratePerSecond":9.450000000000001,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 152,
    burnRatePerSecond: 10.5,
  },

});
