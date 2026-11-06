// Элемент #0 — Воздух. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","empty","gases"],
  summary: "Газовая среда с давлением, температурой и ветром",
  def: {
    id: 0,
    key: "empty",
    name: "Воздух",
    shortDesc: "Газовая среда с давлением, температурой и ветром",
    category: "gases",
    state: "empty",
    selectable: false,
    density: 1.225,
    specificHeat: 1,
    thermalCond: 0.03,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 0,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [11,16,22],
    accentColor: [20,30,42],
    metallic: 0,
    roughness: 1,
    opacity: 0,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
