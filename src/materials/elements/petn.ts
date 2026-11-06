// Элемент #103 — ТЭН (взрывчатка). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","explosives","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 103,
    key: "petn",
    name: "ТЭН (взрывчатка)",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1770,
    specificHeat: 1.15,
    thermalCond: 0.09,
    flammability: 0.6,
    ignitionTempC: 240,
    burnHeat: 120,
    explosivePower: 2,
    detonationShockKPa: 55,
    acidResistance: 0.65,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 160,
    elecCond: 0,
    baseColor: [235,228,211],
    accentColor: [242,206,134],
    metallic: 0.06,
    roughness: 0.62,
    opacity: 1,
    emissive: 0,
    textureStyle: "explosive",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":240,"ratePerSecond":12.6,"produce":62},
    {"note":"Детонация, мощность 2","trigger":"shock","minTempC":240,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
