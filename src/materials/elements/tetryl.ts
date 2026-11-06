// Элемент #230 — Тетрил. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","explosives","granular","selectable"],
  summary: "Бризантное ВВ-усилитель (1,73 г/см³). Промежуточный детонатор между капсюлем и зарядом.",
  def: {
    id: 230,
    key: "tetryl",
    name: "Тетрил",
    shortDesc: "Бризантное ВВ-усилитель (1,73 г/см³). Промежуточный детонатор между капсюлем и зарядом.",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1730,
    specificHeat: 1.05,
    thermalCond: 0.08,
    flammability: 0.75,
    ignitionTempC: 260,
    burnHeat: 128,
    explosivePower: 1.7,
    detonationShockKPa: 22,
    acidResistance: 0.45,
    porosity: 0,
    viscosity: 0.4,
    dispersion: 1,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [216,202,154],
    accentColor: [244,234,196],
    metallic: 0,
    roughness: 0.6,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":260,"ratePerSecond":15.75,"produce":62},
    {"note":"Детонация, мощность 1.7","trigger":"shock","minTempC":260,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
