// Элемент #232 — Нитроцеллюлоза. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","explosives","granular","selectable"],
  summary: "Пироксилин. Очень быстро вспыхивает при 170 °C, сгорает почти без дыма.",
  def: {
    id: 232,
    key: "nitrocellulose",
    name: "Нитроцеллюлоза",
    shortDesc: "Пироксилин. Очень быстро вспыхивает при 170 °C, сгорает почти без дыма.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 1350,
    specificHeat: 1.3,
    thermalCond: 0.05,
    flammability: 0.98,
    ignitionTempC: 170,
    burnHeat: 120,
    explosivePower: 1,
    acidResistance: 0.2,
    porosity: 0.35,
    viscosity: 0.3,
    dispersion: 2,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [232,226,198],
    accentColor: [250,246,226],
    metallic: 0,
    roughness: 0.8,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
    detonationShockKPa: 18,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":170,"ratePerSecond":20.58,"produce":62},
    {"note":"Детонация, мощность 1","trigger":"shock","minTempC":170,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 116,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
