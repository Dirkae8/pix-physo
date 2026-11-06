// Элемент #133 — Обратный клапан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","electric","selectable"],
  summary: "Пропускает жидкость только в выбранном направлении при перепаде давления.",
  def: {
    id: 133,
    key: "valve",
    name: "Обратный клапан",
    shortDesc: "Пропускает жидкость только в выбранном направлении при перепаде давления.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 4200,
    specificHeat: 0.6,
    thermalCond: 0.35,
    meltTempC: 1380,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.55,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 780,
    elecCond: 0,
    baseColor: [136,145,158],
    accentColor: [212,238,255],
    metallic: 0.82,
    roughness: 0.24,
    opacity: 1,
    emissive: 0.16,
    textureStyle: "fan",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1380,"ratePerSecond":4.8,"produce":69},
  ],
  behavior: {

  },

});
