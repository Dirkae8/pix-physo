// Элемент #52 — Лампа LED. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Мощный галогенно-светодиодный прожектор. Ярко освещает сцену при подаче напряжения.",
  def: {
    id: 52,
    key: "lamp",
    name: "Лампа LED",
    shortDesc: "Мощный галогенно-светодиодный прожектор. Ярко освещает сцену при подаче напряжения.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 2600,
    specificHeat: 0.78,
    thermalCond: 0.2,
    meltTempC: 1200,
    meltInto: 70,
    flammability: 0,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 95,
    elecCond: 0.76,
    elecResistanceHeat: 0.08,
    baseColor: [242,232,168],
    accentColor: [255,252,225],
    metallic: 0.25,
    roughness: 0.12,
    opacity: 0.92,
    emissive: 0.25,
    textureStyle: "lamp",
  },
  reactions: [
    {"note":"Плавление → #70","trigger":"heat","minTempC":1200,"ratePerSecond":4.8,"produce":70},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
