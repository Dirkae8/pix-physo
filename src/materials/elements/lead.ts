// Элемент #12 — Свинец. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Сверхплотный металл (11340 кг/м³). Поглощает нейтроны и радиацию, плавится при 327 °C.",
  def: {
    id: 12,
    key: "lead",
    name: "Свинец",
    shortDesc: "Сверхплотный металл (11340 кг/м³). Поглощает нейтроны и радиацию, плавится при 327 °C.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 11340,
    specificHeat: 0.13,
    thermalCond: 0.42,
    meltTempC: 327,
    meltInto: 120,
    flammability: 0,
    acidResistance: 0.72,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 210,
    elecCond: 0.35,
    baseColor: [88,94,106],
    accentColor: [132,140,154],
    metallic: 0.78,
    roughness: 0.46,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #120","trigger":"heat","minTempC":327,"ratePerSecond":4.8,"produce":120},
  ],
  behavior: {

  },

});
