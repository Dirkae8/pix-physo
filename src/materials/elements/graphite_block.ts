// Элемент #165 — Графитовый блок. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","powder","powders","granular","selectable"],
  summary: "Прессованный графит (2200 кг/м³). Проводит ток и тепло вдоль слоёв, держится до 3000 °C в инертной среде.",
  def: {
    id: 165,
    key: "graphite_block",
    name: "Графитовый блок",
    shortDesc: "Прессованный графит (2200 кг/м³). Проводит ток и тепло вдоль слоёв, держится до 3000 °C в инертной среде.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2200,
    specificHeat: 0.71,
    thermalCond: 0.85,
    flammability: 0.12,
    ignitionTempC: 620,
    burnHeat: 28,
    acidResistance: 0.98,
    porosity: 0.06,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 90,
    elecCond: 0.7,
    baseColor: [58,60,64],
    accentColor: [116,120,126],
    metallic: 0.3,
    roughness: 0.6,
    opacity: 1,
    emissive: 0,
    textureStyle: "coal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":620,"ratePerSecond":2.52,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    capillary: 99,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
