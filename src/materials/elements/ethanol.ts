// Элемент #32 — Спирт. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Этиловый спирт C₂H₅OH (789 кг/м³). Горит чистым голубоватым пламенем без копоти.",
  def: {
    id: 32,
    key: "ethanol",
    name: "Спирт",
    shortDesc: "Этиловый спирт C₂H₅OH (789 кг/м³). Горит чистым голубоватым пламенем без копоти.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 789,
    specificHeat: 2.44,
    thermalCond: 0.11,
    boilTempC: 78.4,
    boilInto: 117,
    freezeTempC: -114,
    freezeInto: 7,
    flammability: 0.78,
    ignitionTempC: 110,
    burnHeat: 48,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 0.04,
    dispersion: 11,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [195,226,245],
    accentColor: [238,248,255],
    metallic: 0.1,
    roughness: 0.04,
    opacity: 0.56,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #117","trigger":"heat","minTempC":78.4,"ratePerSecond":0.11,"produce":117},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-114,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":110,"ratePerSecond":16.38,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
