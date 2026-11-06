// Элемент #205 — Сероводород. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "H₂S (1,54 кг/м³). Горючий тяжёлый газ, при сгорании даёт сернистый газ.",
  def: {
    id: 205,
    key: "hydrogen_sulfide",
    name: "Сероводород",
    shortDesc: "H₂S (1,54 кг/м³). Горючий тяжёлый газ, при сгорании даёт сернистый газ.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.54,
    specificHeat: 1,
    thermalCond: 0.04,
    flammability: 0.9,
    ignitionTempC: 260,
    burnHeat: 58,
    explosivePower: 0.68,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [188,196,140],
    accentColor: [222,230,182],
    metallic: 0,
    roughness: 1,
    opacity: 0.38,
    emissive: 0.05,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":260,"ratePerSecond":18.900000000000002,"produce":62},
    {"note":"Детонация, мощность 0.68","trigger":"shock","minTempC":260,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
