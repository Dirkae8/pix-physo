// Элемент #171 — Стиральный порошок. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "ПАВ с наполнителем (900 кг/м³). Растворяется в воде, снижает поверхностное натяжение.",
  def: {
    id: 171,
    key: "detergent",
    name: "Стиральный порошок",
    shortDesc: "ПАВ с наполнителем (900 кг/м³). Растворяется в воде, снижает поверхностное натяжение.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 900,
    specificHeat: 1.4,
    thermalCond: 0.04,
    flammability: 0.18,
    acidResistance: 0.4,
    porosity: 0.35,
    waterSoluble: true,
    viscosity: 0.35,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0.05,
    baseColor: [226,232,240],
    accentColor: [248,250,255],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
    ignitionTempC: 420,
    burnHeat: 18,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":420,"ratePerSecond":3.78,"produce":62},
    {"note":"Растворение в воде","trigger":"wet","with":[24],"ratePerSecond":2.7,"produce":71},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 116,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
