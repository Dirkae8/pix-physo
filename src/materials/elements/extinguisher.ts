// Элемент #134 — Огнетушитель. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","tool","tools","selectable"],
  summary: "Охлаждает область и вытесняет огонь углекислым газом.",
  def: {
    id: 134,
    key: "extinguisher",
    name: "Огнетушитель",
    shortDesc: "Охлаждает область и вытесняет огонь углекислым газом.",
    category: "tools",
    state: "tool",
    selectable: true,
    density: 0,
    specificHeat: 1,
    thermalCond: 0,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 0,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [220,72,72],
    accentColor: [224,248,255],
    metallic: 0.4,
    roughness: 0.3,
    opacity: 1,
    emissive: 0.6,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },

});
