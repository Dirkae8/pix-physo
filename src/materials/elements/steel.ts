// Элемент #3 — Сталь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Конструкционная сталь. Проводит ток и тепло, раскаляется добела и плавится при 1538 °C.",
  def: {
    id: 3,
    key: "steel",
    name: "Сталь",
    shortDesc: "Конструкционная сталь. Проводит ток и тепло, раскаляется добела и плавится при 1538 °C.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 7850,
    specificHeat: 0.49,
    thermalCond: 0.62,
    meltTempC: 1538,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.25,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 1350,
    elecCond: 0.78,
    elecResistanceHeat: 0.06,
    baseColor: [152,162,174],
    accentColor: [222,230,240],
    metallic: 0.92,
    roughness: 0.26,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1538,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
