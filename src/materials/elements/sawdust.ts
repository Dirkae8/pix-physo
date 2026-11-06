// Элемент #19 — Опилки. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Древесная стружка. Впитывает разливы масла, легко раздувается ветром и вспыхивает в воздухе.",
  def: {
    id: 19,
    key: "sawdust",
    name: "Опилки",
    shortDesc: "Древесная стружка. Впитывает разливы масла, легко раздувается ветром и вспыхивает в воздухе.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 290,
    specificHeat: 1.5,
    thermalCond: 0.04,
    flammability: 0.78,
    ignitionTempC: 210,
    burnHeat: 36,
    acidResistance: 0.15,
    porosity: 0.75,
    viscosity: 0.18,
    dispersion: 1,
    reposeSkip: 0.26,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [208,168,108],
    accentColor: [172,130,74],
    metallic: 0,
    roughness: 0.88,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":210,"ratePerSecond":16.38,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 140,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
