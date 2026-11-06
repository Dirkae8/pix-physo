// Элемент #47 — Генератор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Промышленный электрогенератор (48 В). Бесперебойно подаёт мощный ток и заряжает аккумуляторы.",
  def: {
    id: 47,
    key: "generator",
    name: "Генератор",
    shortDesc: "Промышленный электрогенератор (48 В). Бесперебойно подаёт мощный ток и заряжает аккумуляторы.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 6400,
    specificHeat: 0.55,
    thermalCond: 0.45,
    meltTempC: 1450,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.45,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 1100,
    elecCond: 0.98,
    baseColor: [218,158,34],
    accentColor: [64,212,255],
    metallic: 0.86,
    roughness: 0.24,
    opacity: 1,
    emissive: 0.32,
    textureStyle: "generator",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1450,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
