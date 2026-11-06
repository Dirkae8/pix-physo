// Элемент #166 — Мрамор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","granular","selectable"],
  summary: "Карбонат кальция (2700 кг/м³). Красивый, но шипит и растворяется в кислоте с выделением CO₂.",
  def: {
    id: 166,
    key: "marble",
    name: "Мрамор",
    shortDesc: "Карбонат кальция (2700 кг/м³). Красивый, но шипит и растворяется в кислоте с выделением CO₂.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2700,
    specificHeat: 0.88,
    thermalCond: 0.14,
    flammability: 0,
    acidResistance: 0.08,
    porosity: 0.02,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 105,
    elecCond: 0,
    baseColor: [222,220,214],
    accentColor: [248,246,240],
    metallic: 0.02,
    roughness: 0.28,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 96,
    carbonate: true,
    granular: true,
  },

});
