// Элемент #182 — Масло растительное. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Подсолнечное масло (920 кг/м³). Всплывает над водой, вязкость падает при нагреве, горит при 320 °C.",
  def: {
    id: 182,
    key: "vegetable_oil",
    name: "Масло растительное",
    shortDesc: "Подсолнечное масло (920 кг/м³). Всплывает над водой, вязкость падает при нагреве, горит при 320 °C.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 920,
    specificHeat: 2,
    thermalCond: 0.09,
    boilTempC: 300,
    boilInto: 247,
    flammability: 0.65,
    ignitionTempC: 320,
    burnHeat: 88,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.28,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [216,190,62],
    accentColor: [248,226,112],
    metallic: 0.02,
    roughness: 0.1,
    opacity: 0.86,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #247","trigger":"heat","minTempC":300,"ratePerSecond":8,"produce":247},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":320,"ratePerSecond":13.65,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
