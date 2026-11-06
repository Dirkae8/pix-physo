// Элемент #14 — Земля. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Плодородный грунт. Впитывает влагу и масла, удерживает крутой склон во влажном виде.",
  def: {
    id: 14,
    key: "soil",
    name: "Земля",
    shortDesc: "Плодородный грунт. Впитывает влагу и масла, удерживает крутой склон во влажном виде.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 1380,
    specificHeat: 1.15,
    thermalCond: 0.08,
    meltTempC: 1550,
    meltInto: 26,
    flammability: 0.03,
    ignitionTempC: 580,
    acidResistance: 0.45,
    porosity: 0.52,
    viscosity: 0.45,
    dispersion: 1,
    reposeSkip: 0.38,
    tensileStrength: 0,
    elecCond: 0.04,
    baseColor: [106,76,52],
    accentColor: [74,52,35],
    metallic: 0,
    roughness: 0.94,
    opacity: 1,
    emissive: 0,
    textureStyle: "soil",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":1550,"ratePerSecond":4.8,"produce":26},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":580,"ratePerSecond":0.63,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 126,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
