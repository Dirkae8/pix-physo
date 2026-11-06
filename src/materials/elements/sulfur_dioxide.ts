// Элемент #204 — Сернистый газ. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "SO₂ (2,63 кг/м³). Тяжёлый едкий газ: скапливается в низинах и подвалах.",
  def: {
    id: 204,
    key: "sulfur_dioxide",
    name: "Сернистый газ",
    shortDesc: "SO₂ (2,63 кг/м³). Тяжёлый едкий газ: скапливается в низинах и подвалах.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 2.63,
    specificHeat: 0.64,
    thermalCond: 0.03,
    flammability: 0,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [196,200,156],
    accentColor: [228,232,198],
    metallic: 0,
    roughness: 1,
    opacity: 0.42,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
