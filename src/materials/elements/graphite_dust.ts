// Элемент #242 — Графитовая пыль. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","powders","granular","selectable"],
  summary: "Тонкий графит (2200 кг/м³). Сыпучий проводник: насыпанная дорожка замыкает цепь.",
  def: {
    id: 242,
    key: "graphite_dust",
    name: "Графитовая пыль",
    shortDesc: "Тонкий графит (2200 кг/м³). Сыпучий проводник: насыпанная дорожка замыкает цепь.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2200,
    specificHeat: 0.71,
    thermalCond: 0.4,
    flammability: 0.15,
    ignitionTempC: 620,
    burnHeat: 24,
    acidResistance: 0.98,
    porosity: 0.2,
    viscosity: 0.25,
    dispersion: 5,
    reposeSkip: 0.18,
    tensileStrength: 0,
    elecCond: 0.55,
    baseColor: [54,56,58],
    accentColor: [108,112,116],
    metallic: 0.25,
    roughness: 0.85,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":620,"ratePerSecond":3.15,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    capillary: 107,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
