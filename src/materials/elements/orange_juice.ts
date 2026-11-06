// Элемент #190 — Апельсиновый сок. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Сок с мякотью (1040 кг/м³). Сахара и кислота, слегка плотнее воды.",
  def: {
    id: 190,
    key: "orange_juice",
    name: "Апельсиновый сок",
    shortDesc: "Сок с мякотью (1040 кг/м³). Сахара и кислота, слегка плотнее воды.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1040,
    specificHeat: 3.8,
    thermalCond: 0.21,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -2,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.075,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.28,
    baseColor: [232,142,32],
    accentColor: [255,190,82],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.88,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":100,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-2,"produce":7},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
  },

});
