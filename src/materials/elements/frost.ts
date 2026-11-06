// Элемент #125 — Иней. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids","granular"],
  summary: "Появляется на холодной поверхности и тает при нагреве.",
  def: {
    id: 125,
    key: "frost",
    name: "Иней",
    shortDesc: "Появляется на холодной поверхности и тает при нагреве.",
    category: "solids",
    state: "solid",
    selectable: false,
    density: 340,
    specificHeat: 2.05,
    thermalCond: 0.06,
    defaultTempC: -5,
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
    baseColor: [220,238,244],
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
    smothers: true,
    granular: true,
  },

});
