// Элемент #7 — Лёд. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Кристаллический водяной лёд (-10 °C). Тает выше 0 °C, легче жидкой воды (917 кг/м³).",
  def: {
    id: 7,
    key: "ice",
    name: "Лёд",
    shortDesc: "Кристаллический водяной лёд (-10 °C). Тает выше 0 °C, легче жидкой воды (917 кг/м³).",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 917,
    specificHeat: 2.05,
    thermalCond: 0.24,
    defaultTempC: -12,
    meltTempC: 0.5,
    meltInto: 24,
    flammability: 0,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 55,
    elecCond: 0,
    baseColor: [164,218,250],
    accentColor: [232,248,255],
    metallic: 0.1,
    roughness: 0.14,
    opacity: 0.78,
    emissive: 0,
    textureStyle: "ice",
  },
  reactions: [
    {"note":"Плавление → #24","trigger":"heat","minTempC":0.5,"ratePerSecond":4.8,"produce":24},
  ],
  behavior: {

  },

});
