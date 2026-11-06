// Элемент #226 — Аммиачная селитра (ANFO). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","explosives","granular","selectable"],
  summary: "Селитра с дизтопливом. Детонирует только от сильного удара — чувствительность низкая.",
  def: {
    id: 226,
    key: "anfo",
    name: "Аммиачная селитра (ANFO)",
    shortDesc: "Селитра с дизтопливом. Детонирует только от сильного удара — чувствительность низкая.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 820,
    specificHeat: 1.5,
    thermalCond: 0.05,
    flammability: 0.35,
    ignitionTempC: 350,
    burnHeat: 70,
    explosivePower: 1.15,
    acidResistance: 0.15,
    porosity: 0.4,
    viscosity: 0.3,
    dispersion: 2,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [226,226,214],
    accentColor: [248,248,238],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
    detonationShockKPa: 72,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":350,"ratePerSecond":7.35,"produce":62},
    {"note":"Детонация, мощность 1.15","trigger":"shock","minTempC":350,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 119,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
