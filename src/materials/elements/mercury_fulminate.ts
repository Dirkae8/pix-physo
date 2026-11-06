// Элемент #227 — Гремучая ртуть. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","explosives","granular","selectable"],
  summary: "Инициирующее вещество: срабатывает от слабого удара или искры. Малая мощность, огромная чувствительность.",
  def: {
    id: 227,
    key: "mercury_fulminate",
    name: "Гремучая ртуть",
    shortDesc: "Инициирующее вещество: срабатывает от слабого удара или искры. Малая мощность, огромная чувствительность.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 4300,
    specificHeat: 0.5,
    thermalCond: 0.06,
    flammability: 0.95,
    ignitionTempC: 160,
    burnHeat: 90,
    explosivePower: 0.85,
    acidResistance: 0.3,
    porosity: 0.1,
    viscosity: 0.3,
    dispersion: 2,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [196,190,176],
    accentColor: [232,228,214],
    metallic: 0.3,
    roughness: 0.6,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
    detonationShockKPa: 8,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":160,"ratePerSecond":19.95,"produce":62},
    {"note":"Детонация, мощность 0.85","trigger":"shock","minTempC":160,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 101,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
