// Элемент #4 — Стекло. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Кварцевое стекло. Преломляет свет, колется в осколки от ударной волны или перепада температур.",
  def: {
    id: 4,
    key: "glass",
    name: "Стекло",
    shortDesc: "Кварцевое стекло. Преломляет свет, колется в осколки от ударной волны или перепада температур.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2500,
    specificHeat: 0.8,
    thermalCond: 0.11,
    meltTempC: 1520,
    meltInto: 70,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 38,
    elecCond: 0,
    baseColor: [172,224,238],
    accentColor: [238,252,255],
    metallic: 0.15,
    roughness: 0.06,
    opacity: 0.48,
    emissive: 0,
    textureStyle: "glass",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1520,"ratePerSecond":4.8,"produce":70},
  ],
  behavior: {

  },

});
