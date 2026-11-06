// Элемент #186 — Пиво. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Светлое пиво (1010 кг/м³), ~5 % этанола и растворённый CO₂: слабо горюче, пенится.",
  def: {
    id: 186,
    key: "beer",
    name: "Пиво",
    shortDesc: "Светлое пиво (1010 кг/м³), ~5 % этанола и растворённый CO₂: слабо горюче, пенится.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1010,
    specificHeat: 4,
    thermalCond: 0.21,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -3,
    freezeInto: 7,
    flammability: 0.12,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.05,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.14,
    baseColor: [206,158,52],
    accentColor: [242,206,96],
    metallic: 0,
    roughness: 0.08,
    opacity: 0.8,
    emissive: 0,
    textureStyle: "liquid_clear",
    ignitionTempC: 360,
    burnHeat: 20,
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":100,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-3,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":360,"ratePerSecond":2.52,"produce":62},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
