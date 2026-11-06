// Элемент #45 — Кабель в изоляции. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Защищённый силовой кабель: проводит ток внутри жилы, не коротит в воде и через корпус.",
  def: {
    id: 45,
    key: "insulated_wire",
    name: "Кабель в изоляции",
    shortDesc: "Защищённый силовой кабель: проводит ток внутри жилы, не коротит в воде и через корпус.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 3800,
    specificHeat: 0.95,
    thermalCond: 0.12,
    meltTempC: 980,
    meltInto: 69,
    flammability: 0.05,
    ignitionTempC: 480,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 540,
    elecCond: 0.96,
    elecResistanceHeat: 0.01,
    baseColor: [32,116,168],
    accentColor: [228,134,76],
    metallic: 0.35,
    roughness: 0.45,
    opacity: 1,
    emissive: 0,
    textureStyle: "cable",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":980,"ratePerSecond":4.8,"produce":69},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":480,"ratePerSecond":1.05,"produce":62},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
