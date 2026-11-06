// Элемент #200 — Жидкое мыло. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "ПАВ-раствор (1050 кг/м³). Вязкий, плотнее воды, гасит пламя и образует пену.",
  def: {
    id: 200,
    key: "liquid_soap",
    name: "Жидкое мыло",
    shortDesc: "ПАВ-раствор (1050 кг/м³). Вязкий, плотнее воды, гасит пламя и образует пену.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1050,
    specificHeat: 3.7,
    thermalCond: 0.2,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -2,
    freezeInto: 7,
    flammability: 0.05,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.45,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.3,
    baseColor: [196,214,226],
    accentColor: [232,244,252],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.9,
    emissive: 0,
    textureStyle: "liquid_clear",
    ignitionTempC: 420,
    burnHeat: 12,
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":100,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-2,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":420,"ratePerSecond":1.05,"produce":62},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
