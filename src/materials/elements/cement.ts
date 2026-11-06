// Элемент #20 — Цемент. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Портландцемент. При смешивании с водой разогревается и затвердевает в прочный монолитный бетон!",
  def: {
    id: 20,
    key: "cement",
    name: "Цемент",
    shortDesc: "Портландцемент. При смешивании с водой разогревается и затвердевает в прочный монолитный бетон!",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1510,
    specificHeat: 0.9,
    thermalCond: 0.1,
    flammability: 0,
    acidResistance: 0.35,
    porosity: 0.45,
    viscosity: 0.35,
    dispersion: 1,
    reposeSkip: 0.28,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [152,156,158],
    accentColor: [122,126,128],
    metallic: 0.02,
    roughness: 0.92,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 122,
    granular: true,
  },

});
