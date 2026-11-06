// Элемент #117 — Пары спирта. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases"],
  summary: "Тяжёлые летучие пары бензина/спирта/масла. Взрываются объёмным термобарическим облаком!",
  def: {
    id: 117,
    key: "ethanol_vapor",
    name: "Пары спирта",
    shortDesc: "Тяжёлые летучие пары бензина/спирта/масла. Взрываются объёмным термобарическим облаком!",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 1.59,
    specificHeat: 1.7,
    thermalCond: 0.06,
    freezeTempC: 60,
    freezeInto: 32,
    flammability: 0.98,
    ignitionTempC: 120,
    burnHeat: 96,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [185,210,230],
    accentColor: [225,240,250],
    metallic: 0,
    roughness: 1,
    opacity: 0.28,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Затвердевание → #32","trigger":"heat","minTempC":60,"produce":32},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":120,"ratePerSecond":20.58,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
