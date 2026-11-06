// Элемент #135 — Водяной пар. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases"],
  summary: "Испарённая вода; конденсируется на холодных поверхностях.",
  def: {
    id: 135,
    key: "water_vapor",
    name: "Водяной пар",
    shortDesc: "Испарённая вода; конденсируется на холодных поверхностях.",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 0.7,
    specificHeat: 2.08,
    thermalCond: 0.09,
    defaultTempC: 118,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.02,
    baseColor: [185,207,225],
    accentColor: [244,250,255],
    metallic: 0,
    roughness: 1,
    opacity: 0.44,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
