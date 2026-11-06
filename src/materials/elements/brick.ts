// Элемент #1 — Кирпич. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Обожжённый глиняный кирпич. Держит жар, трескается от мощной взрывной волны.",
  def: {
    id: 1,
    key: "brick",
    name: "Кирпич",
    shortDesc: "Обожжённый глиняный кирпич. Держит жар, трескается от мощной взрывной волны.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1920,
    specificHeat: 0.84,
    thermalCond: 0.14,
    meltTempC: 1650,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.55,
    porosity: 0.14,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 340,
    elecCond: 0,
    baseColor: [168,72,52],
    accentColor: [205,192,175],
    metallic: 0.02,
    roughness: 0.88,
    opacity: 1,
    emissive: 0,
    textureStyle: "brick",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":1650,"ratePerSecond":4.8,"produce":26},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 103,
  },

});
