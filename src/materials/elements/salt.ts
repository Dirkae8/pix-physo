// Элемент #15 — Соль. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Кристаллы NaCl. Растворяется в воде с образованием электропроводного рассола, выпадает при кипении.",
  def: {
    id: 15,
    key: "salt",
    name: "Соль",
    shortDesc: "Кристаллы NaCl. Растворяется в воде с образованием электропроводного рассола, выпадает при кипении.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2165,
    specificHeat: 0.88,
    thermalCond: 0.14,
    meltTempC: 801,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.6,
    porosity: 0.22,
    waterSoluble: true,
    viscosity: 0.25,
    dispersion: 1,
    reposeSkip: 0.22,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [238,242,247],
    accentColor: [204,214,228],
    metallic: 0.12,
    roughness: 0.36,
    opacity: 0.96,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":801,"ratePerSecond":4.8,"produce":26},
    {"note":"Растворение в воде","trigger":"wet","with":[24],"ratePerSecond":2.7,"produce":71},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 108,
    granular: true,
  },

});
