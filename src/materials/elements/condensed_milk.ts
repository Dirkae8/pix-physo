// Элемент #189 — Сгущённое молоко. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Сгущёнка с сахаром (1300 кг/м³). Очень вязкая: растекается медленно и тонет в воде.",
  def: {
    id: 189,
    key: "condensed_milk",
    name: "Сгущённое молоко",
    shortDesc: "Сгущёнка с сахаром (1300 кг/м³). Очень вязкая: растекается медленно и тонет в воде.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1300,
    specificHeat: 2.6,
    thermalCond: 0.16,
    flammability: 0.18,
    ignitionTempC: 380,
    burnHeat: 36,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.88,
    dispersion: 3,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.16,
    baseColor: [232,218,180],
    accentColor: [250,238,210],
    metallic: 0,
    roughness: 0.12,
    opacity: 0.97,
    emissive: 0,
    textureStyle: "liquid_oil",
    boilTempC: 105,
    boilInto: 246,
    freezeTempC: -12,
    freezeInto: 7,
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":105,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-12,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":380,"ratePerSecond":3.78,"produce":62},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
