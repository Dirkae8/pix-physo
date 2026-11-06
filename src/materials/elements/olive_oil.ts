// Элемент #198 — Оливковое масло. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Оливковое масло (910 кг/м³). Всплывает над водой, застывает на холоде, горит при 320 °C.",
  def: {
    id: 198,
    key: "olive_oil",
    name: "Оливковое масло",
    shortDesc: "Оливковое масло (910 кг/м³). Всплывает над водой, застывает на холоде, горит при 320 °C.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 910,
    specificHeat: 2,
    thermalCond: 0.09,
    boilTempC: 300,
    boilInto: 247,
    flammability: 0.62,
    ignitionTempC: 320,
    burnHeat: 86,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.32,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [166,176,54],
    accentColor: [214,222,104],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.86,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #247","trigger":"heat","minTempC":300,"ratePerSecond":8,"produce":247},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":320,"ratePerSecond":13.02,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
