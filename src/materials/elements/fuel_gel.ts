// Элемент #108 — Топливный гель. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","explosives","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 108,
    key: "fuel_gel",
    name: "Топливный гель",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "explosives",
    state: "liquid",
    selectable: true,
    density: 900,
    specificHeat: 1.85,
    thermalCond: 0.1,
    flammability: 0.85,
    ignitionTempC: 115,
    burnHeat: 115,
    acidResistance: 0.65,
    porosity: 0,
    viscosity: 0.68,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [223,120,48],
    accentColor: [255,198,78],
    metallic: 0.1,
    roughness: 0.15,
    opacity: 0.9,
    emissive: 0.12,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":115,"ratePerSecond":17.849999999999998,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
