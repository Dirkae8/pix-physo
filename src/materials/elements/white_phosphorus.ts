// Элемент #107 — Белый фосфор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","explosives","granular","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 107,
    key: "white_phosphorus",
    name: "Белый фосфор",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 1820,
    specificHeat: 0.95,
    thermalCond: 0.08,
    flammability: 0.9,
    ignitionTempC: 40,
    burnHeat: 92,
    explosivePower: 0.72,
    acidResistance: 0.2,
    porosity: 0.25,
    viscosity: 0.25,
    dispersion: 1,
    reposeSkip: 0.22,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [231,229,178],
    accentColor: [96,98,108],
    metallic: 0.15,
    roughness: 0.78,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":40,"ratePerSecond":18.900000000000002,"produce":62},
    {"note":"Детонация, мощность 0.72","trigger":"shock","minTempC":40,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 110,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
