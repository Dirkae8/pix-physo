// Элемент #138 — Компрессор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","electric","selectable"],
  summary: "Под напряжением перемещает воздух и повышает давление на выходе.",
  def: {
    id: 138,
    key: "compressor",
    name: "Компрессор",
    shortDesc: "Под напряжением перемещает воздух и повышает давление на выходе.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 4200,
    specificHeat: 0.6,
    thermalCond: 0.35,
    meltTempC: 1380,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.55,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 780,
    elecCond: 0.85,
    baseColor: [163,157,119],
    accentColor: [212,238,255],
    metallic: 0.82,
    roughness: 0.24,
    opacity: 1,
    emissive: 0.16,
    textureStyle: "fan",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1380,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
