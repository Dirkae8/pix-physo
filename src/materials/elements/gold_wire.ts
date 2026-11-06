// Элемент #215 — Золотой провод. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Золото (19 320 кг/м³). Не окисляется, отличный проводник; плавится при 1064 °C.",
  def: {
    id: 215,
    key: "gold_wire",
    name: "Золотой провод",
    shortDesc: "Золото (19 320 кг/м³). Не окисляется, отличный проводник; плавится при 1064 °C.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 19320,
    specificHeat: 0.13,
    thermalCond: 0.9,
    meltTempC: 1064,
    meltInto: 119,
    flammability: 0,
    acidResistance: 0.99,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 220,
    elecCond: 0.85,
    elecResistanceHeat: 0.012,
    baseColor: [222,176,62],
    accentColor: [252,224,128],
    metallic: 0.98,
    roughness: 0.18,
    opacity: 1,
    emissive: 0,
    textureStyle: "wire",
  },
  reactions: [
    {"note":"Плавление → #119","trigger":"heat","minTempC":1064,"ratePerSecond":4.8,"produce":119},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
