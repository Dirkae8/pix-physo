// Элемент #196 — Толуол. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Толуол (867 кг/м³). Растворитель с температурой кипения 111 °C, легче воды.",
  def: {
    id: 196,
    key: "toluene",
    name: "Толуол",
    shortDesc: "Толуол (867 кг/м³). Растворитель с температурой кипения 111 °C, легче воды.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 867,
    specificHeat: 1.7,
    thermalCond: 0.08,
    boilTempC: 111,
    boilInto: 248,
    flammability: 0.92,
    ignitionTempC: 480,
    burnHeat: 100,
    explosivePower: 0.35,
    acidResistance: 0.88,
    porosity: 0,
    viscosity: 0.06,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [210,214,220],
    accentColor: [238,242,248],
    metallic: 0,
    roughness: 0.06,
    opacity: 0.7,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #248","trigger":"heat","minTempC":111,"ratePerSecond":0.11,"produce":248},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":480,"ratePerSecond":19.32,"produce":62},
    {"note":"Детонация, мощность 0.35","trigger":"shock","minTempC":480,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
