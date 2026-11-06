// Элемент #85 — Калий. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 85,
    key: "potassium",
    name: "Калий",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 862,
    specificHeat: 1.23,
    thermalCond: 0.72,
    meltTempC: 98,
    meltInto: 69,
    flammability: 0.65,
    ignitionTempC: 120,
    burnHeat: 85,
    explosivePower: 0.55,
    acidResistance: 0,
    porosity: 0,
    viscosity: 0.35,
    dispersion: 1,
    reposeSkip: 0.3,
    tensileStrength: 0,
    elecCond: 0.82,
    baseColor: [195,195,202],
    accentColor: [242,245,250],
    metallic: 0.85,
    roughness: 0.32,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":98,"ratePerSecond":4.8,"produce":69},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":120,"ratePerSecond":13.65,"produce":62},
    {"note":"Детонация, мощность 0.55","trigger":"shock","minTempC":120,"ratePerSecond":0,"produce":63},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
