// Элемент #208 — Ксенон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "Инертный Xe (5,9 кг/м³). Один из самых тяжёлых газов: «наливается» в траншеи как вода.",
  def: {
    id: 208,
    key: "xenon",
    name: "Ксенон",
    shortDesc: "Инертный Xe (5,9 кг/м³). Один из самых тяжёлых газов: «наливается» в траншеи как вода.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 5.9,
    specificHeat: 0.16,
    thermalCond: 0.02,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 5,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [146,128,214],
    accentColor: [196,182,244],
    metallic: 0,
    roughness: 1,
    opacity: 0.36,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
