// Элемент #151 — Картон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Гофрокартон (690 кг/м³). Воздушные прослойки работают теплоизолятором, но легко занимаются.",
  def: {
    id: 151,
    key: "cardboard",
    name: "Картон",
    shortDesc: "Гофрокартон (690 кг/м³). Воздушные прослойки работают теплоизолятором, но легко занимаются.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 690,
    specificHeat: 1.4,
    thermalCond: 0.035,
    flammability: 0.88,
    ignitionTempC: 250,
    burnHeat: 34,
    acidResistance: 0.12,
    porosity: 0.78,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 24,
    elecCond: 0,
    baseColor: [186,152,108],
    accentColor: [220,190,146],
    metallic: 0,
    roughness: 0.94,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":250,"ratePerSecond":18.48,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 130,
    sheet: true,
    burnRatePerSecond: 5,
    burnProduct: 250,
  },

});
