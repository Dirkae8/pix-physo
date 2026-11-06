// Элемент #33 — Мёд. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Сверхвязкая ньютоновская жидкость (1420 кг/м³). Тонет в воде, разжижается при нагревании.",
  def: {
    id: 33,
    key: "honey",
    name: "Мёд",
    shortDesc: "Сверхвязкая ньютоновская жидкость (1420 кг/м³). Тонет в воде, разжижается при нагревании.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1420,
    specificHeat: 2.4,
    thermalCond: 0.12,
    flammability: 0.18,
    ignitionTempC: 250,
    burnHeat: 34,
    acidResistance: 0.12,
    porosity: 0,
    viscosity: 0.82,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [222,146,18],
    accentColor: [255,204,72],
    metallic: 0.14,
    roughness: 0.09,
    opacity: 0.88,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":250,"ratePerSecond":3.78,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
