// Элемент #197 — Скипидар. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Живичный скипидар (860 кг/м³). Летучий растворитель красок, кипит при 155 °C.",
  def: {
    id: 197,
    key: "turpentine",
    name: "Скипидар",
    shortDesc: "Живичный скипидар (860 кг/м³). Летучий растворитель красок, кипит при 155 °C.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 860,
    specificHeat: 1.8,
    thermalCond: 0.07,
    boilTempC: 155,
    boilInto: 247,
    flammability: 0.9,
    ignitionTempC: 220,
    burnHeat: 98,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 0.1,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [214,204,152],
    accentColor: [242,234,190],
    metallic: 0,
    roughness: 0.09,
    opacity: 0.76,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #247","trigger":"heat","minTempC":155,"ratePerSecond":8,"produce":247},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":220,"ratePerSecond":18.900000000000002,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
