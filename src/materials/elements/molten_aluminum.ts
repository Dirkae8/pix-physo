// Элемент #118 — Расплав алюминия. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids"],
  summary: "При охлаждении застывает обратно в Алюминий.",
  def: {
    id: 118,
    key: "molten_aluminum",
    name: "Расплав алюминия",
    shortDesc: "При охлаждении застывает обратно в Алюминий.",
    category: "liquids",
    state: "liquid",
    selectable: false,
    density: 2375,
    specificHeat: 0.55,
    thermalCond: 0.65,
    defaultTempC: 760,
    freezeTempC: 650,
    freezeInto: 81,
    flammability: 0,
    acidResistance: 0.4,
    porosity: 0,
    viscosity: 0.35,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.85,
    baseColor: [255,168,52],
    accentColor: [255,244,186],
    metallic: 0.75,
    roughness: 0.15,
    opacity: 1,
    emissive: 1.65,
    textureStyle: "lava",
  },
  reactions: [
    {"note":"Затвердевание → #81","trigger":"heat","minTempC":650,"produce":81},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
