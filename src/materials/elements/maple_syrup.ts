// Элемент #191 — Кленовый сироп. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Концентрированный сахарный сироп (1330 кг/м³). Вязкий, при перегреве карамелизуется в уголь.",
  def: {
    id: 191,
    key: "maple_syrup",
    name: "Кленовый сироп",
    shortDesc: "Концентрированный сахарный сироп (1330 кг/м³). Вязкий, при перегреве карамелизуется в уголь.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1330,
    specificHeat: 2.4,
    thermalCond: 0.15,
    flammability: 0.25,
    ignitionTempC: 350,
    burnHeat: 42,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.82,
    dispersion: 3,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.12,
    baseColor: [166,94,34],
    accentColor: [214,140,62],
    metallic: 0,
    roughness: 0.12,
    opacity: 0.92,
    emissive: 0,
    textureStyle: "liquid_oil",
    boilTempC: 104,
    boilInto: 246,
    freezeTempC: -15,
    freezeInto: 7,
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":104,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-15,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":350,"ratePerSecond":5.25,"produce":62},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
