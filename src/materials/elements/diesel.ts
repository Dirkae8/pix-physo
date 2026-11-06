// Элемент #192 — Дизельное топливо. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Дизель (840 кг/м³). Всплывает над водой, воспламеняется при ~210 °C, кипит при 280 °C.",
  def: {
    id: 192,
    key: "diesel",
    name: "Дизельное топливо",
    shortDesc: "Дизель (840 кг/м³). Всплывает над водой, воспламеняется при ~210 °C, кипит при 280 °C.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 840,
    specificHeat: 2,
    thermalCond: 0.08,
    boilTempC: 280,
    boilInto: 247,
    flammability: 0.88,
    ignitionTempC: 210,
    burnHeat: 105,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.16,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [186,164,82],
    accentColor: [226,204,122],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.8,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #247","trigger":"heat","minTempC":280,"ratePerSecond":8,"produce":247},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":210,"ratePerSecond":18.48,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
