// Элемент #99 — Резистор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","electric","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 99,
    key: "resistor",
    name: "Резистор",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 3000,
    specificHeat: 0.45,
    thermalCond: 0.55,
    meltTempC: 1420,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.78,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 960,
    elecCond: 0.24,
    elecResistanceHeat: 1.8,
    baseColor: [184,145,98],
    accentColor: [255,138,56],
    metallic: 0.82,
    roughness: 0.34,
    opacity: 1,
    emissive: 0,
    textureStyle: "heater",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1420,"ratePerSecond":4.8,"produce":69},
  ],
  behavior: {

  },

});
