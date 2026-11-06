// Элемент #9 — Резина. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Диэлектрик и демпфер. Полностью изолирует электричество, промерзает в жидком азоте.",
  def: {
    id: 9,
    key: "rubber",
    name: "Резина",
    shortDesc: "Диэлектрик и демпфер. Полностью изолирует электричество, промерзает в жидком азоте.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1150,
    specificHeat: 1.9,
    thermalCond: 0.03,
    flammability: 0.25,
    ignitionTempC: 315,
    burnHeat: 42,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 240,
    elecCond: 0,
    baseColor: [44,47,53],
    accentColor: [78,83,92],
    metallic: 0.05,
    roughness: 0.68,
    opacity: 1,
    emissive: 0,
    textureStyle: "rubber",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":315,"ratePerSecond":5.25,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
