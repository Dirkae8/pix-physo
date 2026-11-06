// Элемент #79 — Жидкий парафин. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids"],
  summary: "Расплавленный парафин (80 °C). Плавает на воде и затвердевает при охлаждении ниже 58 °C.",
  def: {
    id: 79,
    key: "molten_wax",
    name: "Жидкий парафин",
    shortDesc: "Расплавленный парафин (80 °C). Плавает на воде и затвердевает при охлаждении ниже 58 °C.",
    category: "liquids",
    state: "liquid",
    selectable: false,
    density: 820,
    specificHeat: 2.2,
    thermalCond: 0.06,
    defaultTempC: 82,
    freezeTempC: 58,
    freezeInto: 11,
    flammability: 0.55,
    ignitionTempC: 205,
    burnHeat: 52,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.24,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [244,232,192],
    accentColor: [255,248,224],
    metallic: 0.08,
    roughness: 0.08,
    opacity: 0.76,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Затвердевание → #11","trigger":"heat","minTempC":58,"produce":11},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":205,"ratePerSecond":11.55,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
