// Элемент #6 — Бетон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Тяжёлый монолитный железобетон для бункеров, плотин и реакторов.",
  def: {
    id: 6,
    key: "concrete",
    name: "Бетон",
    shortDesc: "Тяжёлый монолитный железобетон для бункеров, плотин и реакторов.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2400,
    specificHeat: 0.88,
    thermalCond: 0.16,
    meltTempC: 1580,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.4,
    porosity: 0.08,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 620,
    elecCond: 0,
    baseColor: [128,132,134],
    accentColor: [164,168,170],
    metallic: 0.04,
    roughness: 0.92,
    opacity: 1,
    emissive: 0,
    textureStyle: "concrete",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":1580,"ratePerSecond":4.8,"produce":26},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 100,
  },

});
