// Элемент #17 — Уголь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Каменный антрацит. Долго горит при 1150 °C, идеален для доменной плавки стали и котлов.",
  def: {
    id: 17,
    key: "coal",
    name: "Уголь",
    shortDesc: "Каменный антрацит. Долго горит при 1150 °C, идеален для доменной плавки стали и котлов.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1450,
    specificHeat: 1.02,
    thermalCond: 0.11,
    flammability: 0.22,
    ignitionTempC: 420,
    burnHeat: 72,
    acidResistance: 0.85,
    porosity: 0.2,
    viscosity: 0.4,
    dispersion: 1,
    reposeSkip: 0.42,
    tensileStrength: 0,
    elecCond: 0.12,
    baseColor: [38,40,45],
    accentColor: [72,76,86],
    metallic: 0.28,
    roughness: 0.55,
    opacity: 1,
    emissive: 0,
    textureStyle: "coal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":420,"ratePerSecond":4.62,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 107,
    granular: true,
    burnRatePerSecond: 0.5,
  },

});
