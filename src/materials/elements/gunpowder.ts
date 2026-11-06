// Элемент #55 — Порох. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","explosives","granular","selectable"],
  summary: "Дымный ружейный порох. Стремительно вспыхивает от искры с разлётом горящих зёрен и дыма.",
  def: {
    id: 55,
    key: "gunpowder",
    name: "Порох",
    shortDesc: "Дымный ружейный порох. Стремительно вспыхивает от искры с разлётом горящих зёрен и дыма.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 1700,
    specificHeat: 0.95,
    thermalCond: 0.08,
    flammability: 0.95,
    ignitionTempC: 170,
    burnHeat: 92,
    explosivePower: 0.72,
    acidResistance: 0.2,
    porosity: 0.25,
    viscosity: 0.25,
    dispersion: 1,
    reposeSkip: 0.22,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [56,58,64],
    accentColor: [96,98,108],
    metallic: 0.15,
    roughness: 0.78,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":170,"ratePerSecond":19.95,"produce":62},
    {"note":"Детонация, мощность 0.72","trigger":"shock","minTempC":170,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 110,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
