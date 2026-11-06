// Элемент #209 — Криптон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "Инертный Kr (3,75 кг/м³). Тяжёлый, не горит, не поддерживает дыхание.",
  def: {
    id: 209,
    key: "krypton",
    name: "Криптон",
    shortDesc: "Инертный Kr (3,75 кг/м³). Тяжёлый, не горит, не поддерживает дыхание.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 3.75,
    specificHeat: 0.25,
    thermalCond: 0.02,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 5,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [122,178,176],
    accentColor: [178,220,218],
    metallic: 0,
    roughness: 1,
    opacity: 0.34,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
