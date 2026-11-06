// Элемент #199 — Касторовое масло. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Касторка (960 кг/м³). Очень вязкое (≈0,65 Па·с), растекается заметно медленнее воды.",
  def: {
    id: 199,
    key: "castor_oil",
    name: "Касторовое масло",
    shortDesc: "Касторка (960 кг/м³). Очень вязкое (≈0,65 Па·с), растекается заметно медленнее воды.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 960,
    specificHeat: 1.9,
    thermalCond: 0.09,
    boilTempC: 313,
    boilInto: 247,
    flammability: 0.55,
    ignitionTempC: 330,
    burnHeat: 84,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.66,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [216,206,146],
    accentColor: [242,234,190],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.88,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #247","trigger":"heat","minTempC":313,"ratePerSecond":8,"produce":247},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":330,"ratePerSecond":11.55,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
