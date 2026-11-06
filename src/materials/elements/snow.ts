// Элемент #18 — Снег. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Лёгкий пушистый снег (-6 °C). Кружится на ветру и тает в воду от тепла.",
  def: {
    id: 18,
    key: "snow",
    name: "Снег",
    shortDesc: "Лёгкий пушистый снег (-6 °C). Кружится на ветру и тает в воду от тепла.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 340,
    specificHeat: 2.05,
    thermalCond: 0.06,
    defaultTempC: -6,
    meltTempC: 0.2,
    meltInto: 24,
    flammability: 0,
    acidResistance: 0.4,
    porosity: 0.65,
    viscosity: 0.15,
    dispersion: 1,
    reposeSkip: 0.35,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [236,245,255],
    accentColor: [198,222,245],
    metallic: 0.06,
    roughness: 0.52,
    opacity: 0.95,
    emissive: 0,
    textureStyle: "snow",
  },
  reactions: [
    {"note":"Плавление → #24","trigger":"heat","minTempC":0.2,"ratePerSecond":4.8,"produce":24},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 134,
    granular: true,
  },

});
