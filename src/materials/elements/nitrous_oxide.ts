// Элемент #202 — Закись азота. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "N₂O (1,98 кг/м³). Стелется по низу, при нагреве отдаёт кислород и усиливает пламя.",
  def: {
    id: 202,
    key: "nitrous_oxide",
    name: "Закись азота",
    shortDesc: "N₂O (1,98 кг/м³). Стелется по низу, при нагреве отдаёт кислород и усиливает пламя.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.98,
    specificHeat: 0.88,
    thermalCond: 0.04,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [176,200,226],
    accentColor: [220,236,250],
    metallic: 0,
    roughness: 1,
    opacity: 0.35,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
