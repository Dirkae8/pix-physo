// Элемент #106 — Вспышечный порошок. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","explosives","granular","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 106,
    key: "flash_powder",
    name: "Вспышечный порошок",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 1900,
    specificHeat: 0.95,
    thermalCond: 0.08,
    flammability: 0.95,
    ignitionTempC: 110,
    burnHeat: 92,
    explosivePower: 1.2,
    acidResistance: 0.2,
    porosity: 0.25,
    viscosity: 0.25,
    dispersion: 1,
    reposeSkip: 0.22,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [177,179,170],
    accentColor: [96,98,108],
    metallic: 0.15,
    roughness: 0.78,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":110,"ratePerSecond":19.95,"produce":62},
    {"note":"Детонация, мощность 1.2","trigger":"shock","minTempC":110,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 110,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
    flameColor: 2,
  },

});
