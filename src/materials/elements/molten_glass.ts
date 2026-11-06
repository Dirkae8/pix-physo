// Элемент #70 — Расплав стекла. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids"],
  summary: "Вязкая силикатная стекломасса из расплавленного песка или стекла. Остывает в прозрачное стекло.",
  def: {
    id: 70,
    key: "molten_glass",
    name: "Расплав стекла",
    shortDesc: "Вязкая силикатная стекломасса из расплавленного песка или стекла. Остывает в прозрачное стекло.",
    category: "liquids",
    state: "liquid",
    selectable: false,
    density: 2380,
    specificHeat: 0.95,
    thermalCond: 0.22,
    defaultTempC: 1650,
    freezeTempC: 1380,
    freezeInto: 4,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.65,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.08,
    baseColor: [255,146,48],
    accentColor: [255,228,142],
    metallic: 0.2,
    roughness: 0.12,
    opacity: 0.92,
    emissive: 1.45,
    textureStyle: "lava",
  },
  reactions: [
    {"note":"Затвердевание → #4","trigger":"heat","minTempC":1380,"produce":4},
  ],
  behavior: {

  },

});
