// Элемент #72 — Сахарный сироп. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids"],
  summary: "Густой раствор сахара в воде (1280 кг/м³). При выкипании карамелизуется.",
  def: {
    id: 72,
    key: "syrup",
    name: "Сахарный сироп",
    shortDesc: "Густой раствор сахара в воде (1280 кг/м³). При выкипании карамелизуется.",
    category: "liquids",
    state: "liquid",
    selectable: false,
    density: 1280,
    specificHeat: 3.1,
    thermalCond: 0.16,
    boilTempC: 112,
    boilInto: 40,
    freezeTempC: -8,
    freezeInto: 7,
    flammability: 0.1,
    ignitionTempC: 230,
    acidResistance: 0.15,
    porosity: 0,
    viscosity: 0.45,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.05,
    baseColor: [212,178,96],
    accentColor: [248,228,168],
    metallic: 0.12,
    roughness: 0.07,
    opacity: 0.8,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #40","trigger":"heat","minTempC":112,"ratePerSecond":0.11,"produce":40},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-8,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":230,"ratePerSecond":2.1,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
