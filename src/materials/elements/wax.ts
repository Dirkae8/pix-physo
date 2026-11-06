// Элемент #11 — Парафин. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Легкоплавкий воск. Плавится уже при 62 °C в жидкий парафин и застывает обратно.",
  def: {
    id: 11,
    key: "wax",
    name: "Парафин",
    shortDesc: "Легкоплавкий воск. Плавится уже при 62 °C в жидкий парафин и застывает обратно.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 900,
    specificHeat: 2.1,
    thermalCond: 0.04,
    meltTempC: 62,
    meltInto: 79,
    flammability: 0.3,
    ignitionTempC: 220,
    burnHeat: 44,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 42,
    elecCond: 0,
    baseColor: [238,226,194],
    accentColor: [252,245,224],
    metallic: 0.04,
    roughness: 0.35,
    opacity: 0.92,
    emissive: 0,
    textureStyle: "wax",
  },
  reactions: [
    {"note":"Плавление → #79","trigger":"heat","minTempC":62,"ratePerSecond":4.8,"produce":79},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":220,"ratePerSecond":6.3,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
