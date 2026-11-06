// Элемент #35 — Водород. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Самый лёгкий газ H₂. Стремительно взмывает вверх и оглушительно взрывается от искры (гремучий газ)!",
  def: {
    id: 35,
    key: "hydrogen",
    name: "Водород",
    shortDesc: "Самый лёгкий газ H₂. Стремительно взмывает вверх и оглушительно взрывается от искры (гремучий газ)!",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.09,
    specificHeat: 14.3,
    thermalCond: 0.32,
    flammability: 0.98,
    ignitionTempC: 190,
    burnHeat: 95,
    explosivePower: 0.92,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [118,186,255],
    accentColor: [195,228,255],
    metallic: 0,
    roughness: 1,
    opacity: 0.34,
    emissive: 0.08,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":190,"ratePerSecond":20.58,"produce":62},
    {"note":"Детонация, мощность 0.92","trigger":"shock","minTempC":190,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
