// Элемент #39 — Кислород. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Чистый окислитель O₂. Многократно усиливает горение углей, металлов, масел и взрывы газов.",
  def: {
    id: 39,
    key: "oxygen",
    name: "Кислород",
    shortDesc: "Чистый окислитель O₂. Многократно усиливает горение углей, металлов, масел и взрывы газов.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.43,
    specificHeat: 0.92,
    thermalCond: 0.06,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [74,168,255],
    accentColor: [164,218,255],
    metallic: 0,
    roughness: 1,
    opacity: 0.32,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
