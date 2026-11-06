// Элемент #244 — Радон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","gas","gases","selectable"],
  summary: "Радиоактивный инертный газ (9,73 кг/м³). Самый тяжёлый газ каталога: стелется по дну.",
  def: {
    id: 244,
    key: "radon",
    name: "Радон",
    shortDesc: "Радиоактивный инертный газ (9,73 кг/м³). Самый тяжёлый газ каталога: стелется по дну.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 9.73,
    specificHeat: 0.09,
    thermalCond: 0.02,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 3,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [154,138,190],
    accentColor: [206,192,236],
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
