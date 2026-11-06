// Элемент #250 — Бумажный пепел. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","powders","granular"],
  summary: "Лёгкий минеральный остаток сгоревшей целлюлозы.",
  def: {
    id: 250,
    key: "paper_ash",
    name: "Бумажный пепел",
    shortDesc: "Лёгкий минеральный остаток сгоревшей целлюлозы.",
    category: "powders",
    state: "powder",
    selectable: false,
    density: 320,
    specificHeat: 0.8,
    thermalCond: 0.03,
    flammability: 0,
    acidResistance: 0.85,
    porosity: 0.5,
    viscosity: 0.35,
    dispersion: 4,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [158,154,148],
    accentColor: [200,196,190],
    metallic: 0,
    roughness: 0.98,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 125,
    granular: true,
  },

});
