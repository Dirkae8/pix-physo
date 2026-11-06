// Элемент #153 — Силикон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Силиконовый каучук. Эластичен и термостоек до 300 °C, не проводит ток, не горит открытым пламенем.",
  def: {
    id: 153,
    key: "silicone",
    name: "Силикон",
    shortDesc: "Силиконовый каучук. Эластичен и термостоек до 300 °C, не проводит ток, не горит открытым пламенем.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1150,
    specificHeat: 1.5,
    thermalCond: 0.035,
    flammability: 0.08,
    ignitionTempC: 430,
    burnHeat: 22,
    acidResistance: 0.95,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 45,
    elecCond: 0,
    baseColor: [176,180,188],
    accentColor: [214,220,226],
    metallic: 0,
    roughness: 0.62,
    opacity: 0.95,
    emissive: 0,
    textureStyle: "rubber",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":430,"ratePerSecond":1.68,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
