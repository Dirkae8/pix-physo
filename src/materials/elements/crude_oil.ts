// Элемент #28 — Нефть. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Густая тёмная сырая нефть (835 кг/м³). Горит жарким пламенем с густым чёрным дымом.",
  def: {
    id: 28,
    key: "crude_oil",
    name: "Нефть",
    shortDesc: "Густая тёмная сырая нефть (835 кг/м³). Горит жарким пламенем с густым чёрным дымом.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 835,
    specificHeat: 2,
    thermalCond: 0.08,
    boilTempC: 310,
    boilInto: 76,
    flammability: 0.48,
    ignitionTempC: 165,
    burnHeat: 60,
    acidResistance: 0.75,
    porosity: 0,
    viscosity: 0.44,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [36,30,26],
    accentColor: [92,72,46],
    metallic: 0.22,
    roughness: 0.1,
    opacity: 0.96,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #76","trigger":"heat","minTempC":310,"ratePerSecond":8,"produce":76},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":165,"ratePerSecond":10.08,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
