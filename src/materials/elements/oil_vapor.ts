// Элемент #247 — Пары масла. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","gas","gases"],
  summary: "Горючие пары углеводородов. Тяжелее воздуха, конденсируются в масло.",
  def: {
    id: 247,
    key: "oil_vapor",
    name: "Пары масла",
    shortDesc: "Горючие пары углеводородов. Тяжелее воздуха, конденсируются в масло.",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 3.2,
    specificHeat: 1.7,
    thermalCond: 0.04,
    freezeTempC: 190,
    freezeInto: 182,
    flammability: 0.9,
    ignitionTempC: 230,
    burnHeat: 92,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [210,200,158],
    accentColor: [240,232,198],
    metallic: 0,
    roughness: 1,
    opacity: 0.4,
    emissive: 0,
    textureStyle: "gas",
    defaultTempC: 220,
  },
  reactions: [
    {"note":"Затвердевание → #182","trigger":"heat","minTempC":190,"produce":182},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":230,"ratePerSecond":18.900000000000002,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
