// Элемент #239 — Оргстекло. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","solids","sheet","selectable"],
  summary: "PMMA (1180 кг/м³). Прозрачнее стекла, легче и не бьётся на осколки, но плавится при 160 °C.",
  def: {
    id: 239,
    key: "acrylic_glass",
    name: "Оргстекло",
    shortDesc: "PMMA (1180 кг/м³). Прозрачнее стекла, легче и не бьётся на осколки, но плавится при 160 °C.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1180,
    specificHeat: 1.45,
    thermalCond: 0.04,
    meltTempC: 160,
    meltInto: 245,
    flammability: 0.55,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 75,
    elecCond: 0,
    baseColor: [196,226,234],
    accentColor: [234,250,255],
    metallic: 0.05,
    roughness: 0.06,
    opacity: 0.42,
    emissive: 0,
    textureStyle: "glass",
    ignitionTempC: 400,
    burnHeat: 58,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":160,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":400,"ratePerSecond":11.55,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
