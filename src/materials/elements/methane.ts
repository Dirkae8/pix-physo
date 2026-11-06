// Элемент #36 — Метан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Природный газ CH₄. Легче воздуха, скапливается под потолком и детонирует объёмной вспышкой.",
  def: {
    id: 36,
    key: "methane",
    name: "Метан",
    shortDesc: "Природный газ CH₄. Легче воздуха, скапливается под потолком и детонирует объёмной вспышкой.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.66,
    specificHeat: 2.2,
    thermalCond: 0.08,
    flammability: 0.88,
    ignitionTempC: 240,
    burnHeat: 78,
    explosivePower: 0.68,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [94,212,188],
    accentColor: [168,245,228],
    metallic: 0,
    roughness: 1,
    opacity: 0.36,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":240,"ratePerSecond":18.48,"produce":62},
    {"note":"Детонация, мощность 0.68","trigger":"shock","minTempC":240,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
