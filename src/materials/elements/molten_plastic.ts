// Элемент #245 — Расплав полимера. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","liquid","liquids"],
  summary: "Вязкий расплав полимера; при остывании застывает обратно в пластик.",
  def: {
    id: 245,
    key: "molten_plastic",
    name: "Расплав полимера",
    shortDesc: "Вязкий расплав полимера; при остывании застывает обратно в пластик.",
    category: "liquids",
    state: "liquid",
    selectable: false,
    density: 1000,
    specificHeat: 1.8,
    thermalCond: 0.05,
    defaultTempC: 180,
    freezeTempC: 95,
    freezeInto: 146,
    flammability: 0.6,
    ignitionTempC: 330,
    burnHeat: 55,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 0.72,
    dispersion: 3,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [214,208,196],
    accentColor: [240,236,226],
    metallic: 0,
    roughness: 0.16,
    opacity: 0.92,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Затвердевание → #146","trigger":"heat","minTempC":95,"produce":146},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":330,"ratePerSecond":12.6,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
