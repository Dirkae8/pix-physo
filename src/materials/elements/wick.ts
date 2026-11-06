// Элемент #145 — Фитиль. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Хлопковый фитиль. Капиллярами тянет масло и керосин вверх и горит медленно, не взрываясь.",
  def: {
    id: 145,
    key: "wick",
    name: "Фитиль",
    shortDesc: "Хлопковый фитиль. Капиллярами тянет масло и керосин вверх и горит медленно, не взрываясь.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 380,
    specificHeat: 1.35,
    thermalCond: 0.045,
    flammability: 0.82,
    ignitionTempC: 230,
    burnHeat: 24,
    acidResistance: 0.3,
    porosity: 0.92,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 9,
    elecCond: 0,
    baseColor: [226,214,184],
    accentColor: [250,242,218],
    metallic: 0,
    roughness: 0.95,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":230,"ratePerSecond":17.22,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 165,
    sheet: true,
    burnRatePerSecond: 0.8,
  },

});
