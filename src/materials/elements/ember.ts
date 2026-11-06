// Элемент #78 — Раскалённая искра. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","tools","granular"],
  summary: "Летящая раскалённая частица металла или угля (1300 °C).",
  def: {
    id: 78,
    key: "ember",
    name: "Раскалённая искра",
    shortDesc: "Летящая раскалённая частица металла или угля (1300 °C).",
    category: "tools",
    state: "powder",
    selectable: false,
    density: 1800,
    specificHeat: 0.7,
    thermalCond: 0.35,
    defaultTempC: 1320,
    flammability: 0,
    acidResistance: 0.8,
    porosity: 0,
    viscosity: 0.1,
    dispersion: 2,
    reposeSkip: 0.1,
    tensileStrength: 0,
    elecCond: 0.3,
    baseColor: [255,152,36],
    accentColor: [255,242,168],
    metallic: 0.3,
    roughness: 0.2,
    opacity: 1,
    emissive: 1.8,
    textureStyle: "plasma",
  },
  reactions: [

  ],
  behavior: {
    granular: true,
  },

});
