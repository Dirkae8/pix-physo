// Элемент #26 — Лава. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Раскалённая магма (1180 °C, 2850 кг/м³). Излучает жар, плавит металлы, стынет в базальт ниже 800 °C.",
  def: {
    id: 26,
    key: "lava",
    name: "Лава",
    shortDesc: "Раскалённая магма (1180 °C, 2850 кг/м³). Излучает жар, плавит металлы, стынет в базальт ниже 800 °C.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 2850,
    specificHeat: 1.15,
    thermalCond: 0.35,
    defaultTempC: 1180,
    freezeTempC: 790,
    freezeInto: 73,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.72,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.18,
    baseColor: [242,78,18],
    accentColor: [255,214,68],
    metallic: 0.08,
    roughness: 0.45,
    opacity: 1,
    emissive: 1.35,
    textureStyle: "lava",
  },
  reactions: [
    {"note":"Затвердевание → #73","trigger":"heat","minTempC":790,"produce":73},
  ],
  behavior: {

  },

});
