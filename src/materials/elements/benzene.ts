// Элемент #195 — Бензол. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Бензол C₆H₆ (876 кг/м³). Летучий, кипит при 80 °C, горит коптящим пламенем.",
  def: {
    id: 195,
    key: "benzene",
    name: "Бензол",
    shortDesc: "Бензол C₆H₆ (876 кг/м³). Летучий, кипит при 80 °C, горит коптящим пламенем.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 876,
    specificHeat: 1.74,
    thermalCond: 0.08,
    boilTempC: 80,
    boilInto: 248,
    flammability: 0.94,
    ignitionTempC: 560,
    burnHeat: 102,
    explosivePower: 0.35,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 0.06,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [202,208,214],
    accentColor: [232,238,244],
    metallic: 0,
    roughness: 0.06,
    opacity: 0.7,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #248","trigger":"heat","minTempC":80,"ratePerSecond":0.11,"produce":248},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":560,"ratePerSecond":19.74,"produce":62},
    {"note":"Детонация, мощность 0.35","trigger":"shock","minTempC":560,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
