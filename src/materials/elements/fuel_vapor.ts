// Элемент #76 — Пары топлива. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","gas","gases"],
  summary: "Тяжёлые летучие пары бензина/спирта/масла. Взрываются объёмным термобарическим облаком!",
  def: {
    id: 76,
    key: "fuel_vapor",
    name: "Пары топлива",
    shortDesc: "Тяжёлые летучие пары бензина/спирта/масла. Взрываются объёмным термобарическим облаком!",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 2.35,
    specificHeat: 1.7,
    thermalCond: 0.06,
    freezeTempC: 15,
    freezeInto: 29,
    flammability: 0.98,
    ignitionTempC: 115,
    burnHeat: 96,
    explosivePower: 0.88,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [228,198,118],
    accentColor: [255,236,178],
    metallic: 0,
    roughness: 1,
    opacity: 0.28,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Затвердевание → #29","trigger":"heat","minTempC":15,"produce":29},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":115,"ratePerSecond":20.58,"produce":62},
    {"note":"Детонация, мощность 0.88","trigger":"shock","minTempC":115,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
