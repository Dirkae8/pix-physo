// Элемент #30 — Кислота. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Концентрированная кислота (1840 кг/м³). Растворяет металлы с выделением водорода, обугливает сахар!",
  def: {
    id: 30,
    key: "acid",
    name: "Кислота",
    shortDesc: "Концентрированная кислота (1840 кг/м³). Растворяет металлы с выделением водорода, обугливает сахар!",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1840,
    specificHeat: 1.4,
    thermalCond: 0.2,
    boilTempC: 330,
    boilInto: 43,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.14,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.75,
    baseColor: [118,232,46],
    accentColor: [198,255,118],
    metallic: 0.1,
    roughness: 0.08,
    opacity: 0.82,
    emissive: 0.25,
    textureStyle: "liquid_glow",
  },
  reactions: [
    {"note":"Кипение → #43","trigger":"heat","minTempC":330,"ratePerSecond":8,"produce":43},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
