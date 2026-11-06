// Элемент #86 — Негашёная известь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","powder","powders","granular","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 86,
    key: "quicklime",
    name: "Негашёная известь",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 3340,
    specificHeat: 0.9,
    thermalCond: 0.1,
    flammability: 0,
    acidResistance: 0.35,
    porosity: 0.45,
    viscosity: 0.35,
    dispersion: 1,
    reposeSkip: 0.28,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [228,226,210],
    accentColor: [122,126,128],
    metallic: 0.02,
    roughness: 0.92,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 122,
    granular: true,
  },

});
