// Элемент #172 — Силикагель. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Пористый SiO₂ (700 кг/м³). Адсорбирует влагу из воздуха и впитывает воду капиллярами.",
  def: {
    id: 172,
    key: "silica_gel",
    name: "Силикагель",
    shortDesc: "Пористый SiO₂ (700 кг/м³). Адсорбирует влагу из воздуха и впитывает воду капиллярами.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 700,
    specificHeat: 0.9,
    thermalCond: 0.035,
    flammability: 0,
    acidResistance: 0.99,
    porosity: 0.92,
    viscosity: 0.4,
    dispersion: 3,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [214,220,224],
    accentColor: [240,246,250],
    metallic: 0,
    roughness: 0.88,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 130,
    granular: true,
  },

});
