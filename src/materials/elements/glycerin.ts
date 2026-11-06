// Элемент #89 — Глицерин. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 89,
    key: "glycerin",
    name: "Глицерин",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1260,
    specificHeat: 2.4,
    thermalCond: 0.12,
    flammability: 0.18,
    ignitionTempC: 250,
    burnHeat: 34,
    acidResistance: 0.12,
    porosity: 0,
    viscosity: 0.82,
    dispersion: 3,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [225,221,190],
    accentColor: [255,204,72],
    metallic: 0.14,
    roughness: 0.09,
    opacity: 0.88,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":250,"ratePerSecond":3.78,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
