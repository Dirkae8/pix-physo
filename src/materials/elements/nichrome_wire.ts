// Элемент #216 — Нихромовая проволока. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "NiCr 80/20 (8400 кг/м³). Высокое сопротивление: под током раскаляется до 1100 °C.",
  def: {
    id: 216,
    key: "nichrome_wire",
    name: "Нихромовая проволока",
    shortDesc: "NiCr 80/20 (8400 кг/м³). Высокое сопротивление: под током раскаляется до 1100 °C.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 8400,
    specificHeat: 0.45,
    thermalCond: 0.3,
    meltTempC: 1400,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 620,
    elecCond: 0.22,
    elecResistanceHeat: 3.2,
    baseColor: [146,142,136],
    accentColor: [204,200,194],
    metallic: 0.8,
    roughness: 0.42,
    opacity: 1,
    emissive: 0,
    textureStyle: "wire",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1400,"ratePerSecond":4.8,"produce":69},
  ],
  behavior: {

  },

});
