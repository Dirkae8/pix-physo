// Элемент #181 — Куриный бульон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Наваристый бульон (1010 кг/м³). Соли и жиры: кипит около 100 °C, проводит ток лучше воды.",
  def: {
    id: 181,
    key: "chicken_broth",
    name: "Куриный бульон",
    shortDesc: "Наваристый бульон (1010 кг/м³). Соли и жиры: кипит около 100 °C, проводит ток лучше воды.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1010,
    specificHeat: 3.9,
    thermalCond: 0.24,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -2,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 0.055,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.34,
    baseColor: [206,172,92],
    accentColor: [240,214,146],
    metallic: 0.05,
    roughness: 0.12,
    opacity: 0.82,
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
