// Элемент #160 — Стеклотекстолит. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "FR-4 — основа печатных плат (1850 кг/м³). Жёсткий диэлектрик, не коротит даже во влажной среде.",
  def: {
    id: 160,
    key: "fr4",
    name: "Стеклотекстолит",
    shortDesc: "FR-4 — основа печатных плат (1850 кг/м³). Жёсткий диэлектрик, не коротит даже во влажной среде.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1850,
    specificHeat: 1.2,
    thermalCond: 0.06,
    flammability: 0.15,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 310,
    elecCond: 0,
    baseColor: [72,126,84],
    accentColor: [122,176,132],
    metallic: 0,
    roughness: 0.5,
    opacity: 1,
    emissive: 0,
    textureStyle: "ceramic",
    ignitionTempC: 340,
    burnHeat: 26,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":340,"ratePerSecond":3.15,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
  },

});
