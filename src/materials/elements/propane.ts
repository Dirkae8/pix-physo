// Элемент #37 — Пропан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Тяжёлый горючий газ C₃H₈ (1.96 кг/м³). Стелется по полу и низинам, взрывается огненным валом!",
  def: {
    id: 37,
    key: "propane",
    name: "Пропан",
    shortDesc: "Тяжёлый горючий газ C₃H₈ (1.96 кг/м³). Стелется по полу и низинам, взрывается огненным валом!",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.96,
    specificHeat: 1.67,
    thermalCond: 0.06,
    flammability: 0.9,
    ignitionTempC: 225,
    burnHeat: 86,
    explosivePower: 0.78,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.03,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [232,168,92],
    accentColor: [255,214,152],
    metallic: 0,
    roughness: 1,
    opacity: 0.4,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":225,"ratePerSecond":18.900000000000002,"produce":62},
    {"note":"Детонация, мощность 0.78","trigger":"shock","minTempC":225,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
