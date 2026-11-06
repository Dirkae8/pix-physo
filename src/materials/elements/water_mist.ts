// Элемент #210 — Водяной туман. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "Микрокапли воды в воздухе. Оседает и конденсируется на холодных поверхностях, гасит огонь.",
  def: {
    id: 210,
    key: "water_mist",
    name: "Водяной туман",
    shortDesc: "Микрокапли воды в воздухе. Оседает и конденсируется на холодных поверхностях, гасит огонь.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.85,
    specificHeat: 2,
    thermalCond: 0.05,
    defaultTempC: 118,
    freezeTempC: 30,
    freezeInto: 24,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.02,
    baseColor: [196,214,226],
    accentColor: [232,244,252],
    metallic: 0,
    roughness: 1,
    opacity: 0.32,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Затвердевание → #24","trigger":"heat","minTempC":30,"produce":24},
  ],
  behavior: {
    smothers: true,
  },

});
