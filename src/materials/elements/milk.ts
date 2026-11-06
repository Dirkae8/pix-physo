// Элемент #183 — Молоко. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Цельное молоко (1030 кг/м³): вода, жир, белок. При кипении образует пенку и пар.",
  def: {
    id: 183,
    key: "milk",
    name: "Молоко",
    shortDesc: "Цельное молоко (1030 кг/м³): вода, жир, белок. При кипении образует пенку и пар.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1030,
    specificHeat: 3.9,
    thermalCond: 0.2,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -1,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.07,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.22,
    baseColor: [242,240,232],
    accentColor: [255,253,248],
    metallic: 0,
    roughness: 0.08,
    opacity: 0.94,
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
