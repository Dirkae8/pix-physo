// Элемент #56 — Тротил (TNT). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","explosives","selectable"],
  summary: "Бризантная шашка ТНТ. Мощная сверхзвуковая ударная волна крушит кирпич, лёд и стекло!",
  def: {
    id: 56,
    key: "tnt",
    name: "Тротил (TNT)",
    shortDesc: "Бризантная шашка ТНТ. Мощная сверхзвуковая ударная волна крушит кирпич, лёд и стекло!",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1654,
    specificHeat: 1.15,
    thermalCond: 0.09,
    flammability: 0.6,
    ignitionTempC: 240,
    burnHeat: 120,
    explosivePower: 1.45,
    detonationShockKPa: 55,
    acidResistance: 0.65,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 160,
    elecCond: 0,
    baseColor: [198,62,48],
    accentColor: [242,206,134],
    metallic: 0.06,
    roughness: 0.62,
    opacity: 1,
    emissive: 0,
    textureStyle: "explosive",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":240,"ratePerSecond":12.6,"produce":62},
    {"note":"Детонация, мощность 1.45","trigger":"shock","minTempC":240,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
