// Элемент #231 — Октоген (HMX). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","explosives","granular","selectable"],
  summary: "Высокоэнергетическое ВВ (1,91 г/см³). Скорость детонации ≈9,1 км/с — один из самых мощных зарядов.",
  def: {
    id: 231,
    key: "hmx",
    name: "Октоген (HMX)",
    shortDesc: "Высокоэнергетическое ВВ (1,91 г/см³). Скорость детонации ≈9,1 км/с — один из самых мощных зарядов.",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1910,
    specificHeat: 1,
    thermalCond: 0.09,
    flammability: 0.6,
    ignitionTempC: 280,
    burnHeat: 140,
    explosivePower: 2.3,
    detonationShockKPa: 35,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 0.4,
    dispersion: 1,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [232,230,222],
    accentColor: [250,248,242],
    metallic: 0,
    roughness: 0.5,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":280,"ratePerSecond":12.6,"produce":62},
    {"note":"Детонация, мощность 2.3","trigger":"shock","minTempC":280,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
