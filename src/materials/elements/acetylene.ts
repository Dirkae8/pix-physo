// Элемент #38 — Ацетилен. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Сварочный газ C₂H₂. Горит и взрывается при температуре свыше 3100 °C — режет сталь!",
  def: {
    id: 38,
    key: "acetylene",
    name: "Ацетилен",
    shortDesc: "Сварочный газ C₂H₂. Горит и взрывается при температуре свыше 3100 °C — режет сталь!",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.1,
    specificHeat: 1.7,
    thermalCond: 0.07,
    flammability: 0.97,
    ignitionTempC: 175,
    burnHeat: 125,
    explosivePower: 1.05,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [245,118,168],
    accentColor: [255,188,216],
    metallic: 0,
    roughness: 1,
    opacity: 0.38,
    emissive: 0.08,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":175,"ratePerSecond":20.37,"produce":62},
    {"note":"Детонация, мощность 1.05","trigger":"shock","minTempC":175,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
