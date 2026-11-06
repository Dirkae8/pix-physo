// Элемент #42 — Углекислый газ. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Тяжёлый негорючий газ CO₂ (1.98 кг/м³). Затекает вниз и мгновенно тушит пламя!",
  def: {
    id: 42,
    key: "co2",
    name: "Углекислый газ",
    shortDesc: "Тяжёлый негорючий газ CO₂ (1.98 кг/м³). Затекает вниз и мгновенно тушит пламя!",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.98,
    specificHeat: 0.84,
    thermalCond: 0.04,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.03,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [148,164,184],
    accentColor: [198,212,226],
    metallic: 0,
    roughness: 1,
    opacity: 0.34,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {
    smothers: true,
  },

});
