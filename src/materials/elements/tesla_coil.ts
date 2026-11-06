// Элемент #53 — Катушка Тесла. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Высоковольтный разрядник! Бьёт ветвистыми плазменными молниями в ближайшие проводники и воду.",
  def: {
    id: 53,
    key: "tesla_coil",
    name: "Катушка Тесла",
    shortDesc: "Высоковольтный разрядник! Бьёт ветвистыми плазменными молниями в ближайшие проводники и воду.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 5800,
    specificHeat: 0.5,
    thermalCond: 0.45,
    meltTempC: 1400,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 820,
    elecCond: 0.94,
    baseColor: [124,92,238],
    accentColor: [198,228,255],
    metallic: 0.88,
    roughness: 0.2,
    opacity: 1,
    emissive: 0.45,
    textureStyle: "tesla",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1400,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
