// Элемент #146 — Пластик ABS. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Ударопрочный ABS (1050 кг/м³). Плавится при 105 °C, горит коптящим пламенем с едким дымом.",
  def: {
    id: 146,
    key: "plastic_abs",
    name: "Пластик ABS",
    shortDesc: "Ударопрочный ABS (1050 кг/м³). Плавится при 105 °C, горит коптящим пламенем с едким дымом.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1050,
    specificHeat: 1.45,
    thermalCond: 0.045,
    flammability: 0.55,
    ignitionTempC: 400,
    burnHeat: 62,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 95,
    elecCond: 0,
    baseColor: [205,208,212],
    accentColor: [240,244,248],
    metallic: 0.02,
    roughness: 0.42,
    opacity: 1,
    emissive: 0,
    textureStyle: "rubber",
    meltTempC: 105,
    meltInto: 245,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":105,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":400,"ratePerSecond":11.55,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
