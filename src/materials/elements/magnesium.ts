// Элемент #84 — Магний. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 84,
    key: "magnesium",
    name: "Магний",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1740,
    specificHeat: 0.45,
    thermalCond: 0.52,
    meltTempC: 1535,
    meltInto: 69,
    flammability: 0.85,
    ignitionTempC: 470,
    burnHeat: 160,
    acidResistance: 0.12,
    porosity: 0.15,
    viscosity: 0.3,
    dispersion: 1,
    reposeSkip: 0.26,
    tensileStrength: 0,
    elecCond: 0.68,
    baseColor: [195,202,200],
    accentColor: [176,184,196],
    metallic: 0.88,
    roughness: 0.38,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1535,"ratePerSecond":4.8,"produce":69},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":470,"ratePerSecond":17.849999999999998,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    capillary: 104,
    granular: true,
    burnRatePerSecond: 10.5,
    flameColor: 2,
  },

});
