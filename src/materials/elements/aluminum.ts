// Элемент #81 — Алюминий. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids","selectable"],
  summary: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
  def: {
    id: 81,
    key: "aluminum",
    name: "Алюминий",
    shortDesc: "Приближённая модель: свойства и поведение зависят от состояния вещества.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 2700,
    specificHeat: 0.49,
    thermalCond: 0.62,
    meltTempC: 660,
    meltInto: 118,
    flammability: 0,
    acidResistance: 0.25,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 1350,
    elecCond: 0.6,
    elecResistanceHeat: 0.06,
    baseColor: [192,201,209],
    accentColor: [222,230,240],
    metallic: 0.92,
    roughness: 0.26,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #118","trigger":"heat","minTempC":660,"ratePerSecond":4.8,"produce":118},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
