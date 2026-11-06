// Элемент #69 — Расплав металла. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","liquid","liquids"],
  summary: "Жидкий раскалённый металл. Проводит ток, излучает ослепительный жар и застывает обратно в сталь.",
  def: {
    id: 69,
    key: "molten_metal",
    name: "Расплав металла",
    shortDesc: "Жидкий раскалённый металл. Проводит ток, излучает ослепительный жар и застывает обратно в сталь.",
    category: "liquids",
    state: "liquid",
    selectable: false,
    density: 7200,
    specificHeat: 0.55,
    thermalCond: 0.65,
    defaultTempC: 1620,
    freezeTempC: 1460,
    freezeInto: 3,
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
    {"note":"Затвердевание → #3","trigger":"heat","minTempC":1460,"produce":3},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
