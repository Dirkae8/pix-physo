// Элемент #150 — Бумага. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Целлюлозный лист (800 кг/м³). Впитывает воду, вспыхивает при 233 °C и оставляет пепел.",
  def: {
    id: 150,
    key: "paper",
    name: "Бумага",
    shortDesc: "Целлюлозный лист (800 кг/м³). Впитывает воду, вспыхивает при 233 °C и оставляет пепел.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 800,
    specificHeat: 1.34,
    thermalCond: 0.05,
    flammability: 0.92,
    ignitionTempC: 233,
    burnHeat: 32,
    acidResistance: 0.15,
    porosity: 0.72,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 18,
    elecCond: 0,
    baseColor: [238,234,220],
    accentColor: [252,250,242],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":233,"ratePerSecond":19.32,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 120,
    sheet: true,
    burnRatePerSecond: 5.5,
    burnProduct: 250,
  },

});
