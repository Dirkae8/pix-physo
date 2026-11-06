// Элемент #101 — Плутоний. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","explosives","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 101,
    key: "plutonium",
    name: "Плутоний",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 19840,
    specificHeat: 0.12,
    thermalCond: 0.42,
    defaultTempC: 48,
    meltTempC: 1132,
    meltInto: 69,
    flammability: 0,
    explosivePower: 2.8,
    acidResistance: 0.45,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 1200,
    elecCond: 0.48,
    baseColor: [122,171,104],
    accentColor: [168,255,112],
    metallic: 0.85,
    roughness: 0.28,
    opacity: 1,
    emissive: 0.55,
    textureStyle: "radioactive",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1132,"ratePerSecond":4.8,"produce":69},
    {"note":"Детонация, мощность 2.8","trigger":"shock","ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
  },

});
