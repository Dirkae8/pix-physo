// Элемент #218 — Графеновый провод. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Графеновая дорожка. Рекордная подвижность электронов и теплопроводность при малой массе.",
  def: {
    id: 218,
    key: "graphene_wire",
    name: "Графеновый провод",
    shortDesc: "Графеновая дорожка. Рекордная подвижность электронов и теплопроводность при малой массе.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 2200,
    specificHeat: 0.7,
    thermalCond: 0.98,
    flammability: 0.1,
    acidResistance: 0.95,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 900,
    elecCond: 0.98,
    elecResistanceHeat: 0.005,
    baseColor: [48,62,72],
    accentColor: [108,142,158],
    metallic: 0.5,
    roughness: 0.28,
    opacity: 1,
    emissive: 0,
    textureStyle: "wire",
    ignitionTempC: 600,
    burnHeat: 20,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":600,"ratePerSecond":2.1,"produce":62},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
