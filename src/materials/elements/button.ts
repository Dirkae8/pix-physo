// Элемент #48 — Кнопка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Тактовая кнопка: нажмите ЛКМ прямо по кнопке на поле (или уроните груз), чтобы подать импульс тока!",
  def: {
    id: 48,
    key: "button",
    name: "Кнопка",
    shortDesc: "Тактовая кнопка: нажмите ЛКМ прямо по кнопке на поле (или уроните груз), чтобы подать импульс тока!",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 3100,
    specificHeat: 0.75,
    thermalCond: 0.2,
    meltTempC: 1100,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 520,
    elecCond: 0.95,
    baseColor: [218,58,68],
    accentColor: [248,250,252],
    metallic: 0.52,
    roughness: 0.32,
    opacity: 1,
    emissive: 0.22,
    textureStyle: "button",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1100,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
