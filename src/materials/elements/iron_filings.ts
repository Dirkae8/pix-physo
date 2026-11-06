// Элемент #23 — Стружка Fe. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Железные опилки. Проводят ток, искрят снопами в огне и пламени кислорода.",
  def: {
    id: 23,
    key: "iron_filings",
    name: "Стружка Fe",
    shortDesc: "Железные опилки. Проводят ток, искрят снопами в огне и пламени кислорода.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 5200,
    specificHeat: 0.45,
    thermalCond: 0.52,
    meltTempC: 1538,
    meltInto: 122,
    flammability: 0.28,
    ignitionTempC: 520,
    burnHeat: 58,
    acidResistance: 0.12,
    porosity: 0.15,
    viscosity: 0.3,
    dispersion: 1,
    reposeSkip: 0.26,
    tensileStrength: 0,
    elecCond: 0.68,
    baseColor: [112,118,126],
    accentColor: [176,184,196],
    metallic: 0.88,
    roughness: 0.38,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #122","trigger":"heat","minTempC":1538,"ratePerSecond":4.8,"produce":122},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":520,"ratePerSecond":5.880000000000001,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    capillary: 104,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
