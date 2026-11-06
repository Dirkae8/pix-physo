// Элемент #176 — Глинозём. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Оксид алюминия Al₂O₃ (3900 кг/м³). Тугоплавкий керамический порошок, почти не проводит ток.",
  def: {
    id: 176,
    key: "alumina",
    name: "Глинозём",
    shortDesc: "Оксид алюминия Al₂O₃ (3900 кг/м³). Тугоплавкий керамический порошок, почти не проводит ток.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 3900,
    specificHeat: 0.88,
    thermalCond: 0.16,
    flammability: 0,
    acidResistance: 0.95,
    porosity: 0.25,
    viscosity: 0.3,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [238,238,234],
    accentColor: [252,252,250],
    metallic: 0,
    roughness: 0.8,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 110,
    granular: true,
  },

});
