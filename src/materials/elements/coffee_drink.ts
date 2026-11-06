// Элемент #188 — Кофе. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Заваренный кофе (1000 кг/м³). Тёмная вода с растворёнными веществами, кипит как вода.",
  def: {
    id: 188,
    key: "coffee_drink",
    name: "Кофе",
    shortDesc: "Заваренный кофе (1000 кг/м³). Тёмная вода с растворёнными веществами, кипит как вода.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1000,
    specificHeat: 4.1,
    thermalCond: 0.22,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -1,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 0.75,
    porosity: 0,
    viscosity: 0.045,
    dispersion: 11,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.2,
    baseColor: [58,34,24],
    accentColor: [112,70,46],
    metallic: 0,
    roughness: 0.08,
    opacity: 0.9,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":100,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-1,"produce":7},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
  },

});
