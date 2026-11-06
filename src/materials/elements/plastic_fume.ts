// Элемент #249 — Едкий дым полимера. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","gas","gases"],
  summary: "Продукт горения пластика: густой коптящий дым.",
  def: {
    id: 249,
    key: "plastic_fume",
    name: "Едкий дым полимера",
    shortDesc: "Продукт горения пластика: густой коптящий дым.",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 1.6,
    specificHeat: 1.1,
    thermalCond: 0.03,
    defaultTempC: 85,
    flammability: 0,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 5,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [64,62,60],
    accentColor: [104,100,96],
    metallic: 0,
    roughness: 1,
    opacity: 0.62,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {
    fume: true,
  },

});
