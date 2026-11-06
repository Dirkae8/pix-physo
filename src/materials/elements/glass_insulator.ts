// Элемент #220 — Стеклянный изолятор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Закалённое стекло. Диэлектрик, но хрупок при резком перепаде температур.",
  def: {
    id: 220,
    key: "glass_insulator",
    name: "Стеклянный изолятор",
    shortDesc: "Закалённое стекло. Диэлектрик, но хрупок при резком перепаде температур.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 2500,
    specificHeat: 0.8,
    thermalCond: 0.1,
    meltTempC: 1500,
    meltInto: 70,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 55,
    elecCond: 0,
    baseColor: [166,216,228],
    accentColor: [226,248,255],
    metallic: 0.1,
    roughness: 0.08,
    opacity: 0.55,
    emissive: 0,
    textureStyle: "glass",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1500,"ratePerSecond":4.8,"produce":70},
  ],
  behavior: {

  },

});
