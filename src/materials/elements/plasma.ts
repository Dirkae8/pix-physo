// Элемент #63 — Разряд энергии. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","energy","tools","selectable"],
  summary: "Высокоэнергетическая плазма и молния (5200 °C). Ионизирует воздух, бьёт током, плавит сталь и песок!",
  def: {
    id: 63,
    key: "plasma",
    name: "Разряд энергии",
    shortDesc: "Высокоэнергетическая плазма и молния (5200 °C). Ионизирует воздух, бьёт током, плавит сталь и песок!",
    category: "tools",
    state: "energy",
    selectable: true,
    density: 0.12,
    specificHeat: 1.5,
    thermalCond: 0.85,
    defaultTempC: 5200,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 1,
    baseColor: [168,108,255],
    accentColor: [238,245,255],
    metallic: 0,
    roughness: 0,
    opacity: 0.98,
    emissive: 2,
    textureStyle: "plasma",
  },
  reactions: [
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
