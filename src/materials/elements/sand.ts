// Элемент #13 — Песок. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Кварцевый песок. Слипается от воды, впитывает масло, плавится выше 1700 °C в жидкое стекло!",
  def: {
    id: 13,
    key: "sand",
    name: "Песок",
    shortDesc: "Кварцевый песок. Слипается от воды, впитывает масло, плавится выше 1700 °C в жидкое стекло!",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1620,
    specificHeat: 0.83,
    thermalCond: 0.09,
    meltTempC: 1710,
    meltInto: 70,
    flammability: 0,
    acidResistance: 0.96,
    porosity: 0.38,
    viscosity: 0.3,
    dispersion: 1,
    reposeSkip: 0.18,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [218,188,126],
    accentColor: [242,218,162],
    metallic: 0.08,
    roughness: 0.72,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1710,"ratePerSecond":4.8,"produce":70},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 118,
    granular: true,
  },

});
