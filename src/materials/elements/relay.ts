// Элемент #136 — Реле. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","electric","selectable"],
  summary: "Силовая цепь вдоль стрелки замыкается напряжением на боковом контакте.",
  def: {
    id: 136,
    key: "relay",
    name: "Реле",
    shortDesc: "Силовая цепь вдоль стрелки замыкается напряжением на боковом контакте.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 3400,
    specificHeat: 0.72,
    thermalCond: 0.22,
    meltTempC: 1150,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 580,
    elecCond: 0.95,
    baseColor: [154,158,153],
    accentColor: [226,232,240],
    metallic: 0.62,
    roughness: 0.28,
    opacity: 1,
    emissive: 0.24,
    textureStyle: "switch",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1150,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
