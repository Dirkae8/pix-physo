// Элемент #34 — Нитроглицерин. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Тяжёлая взрывчатая жидкость (1600 кг/м³). Детонирует от удара, давления, искры или нагрева!",
  def: {
    id: 34,
    key: "nitroglycerin",
    name: "Нитроглицерин",
    shortDesc: "Тяжёлая взрывчатая жидкость (1600 кг/м³). Детонирует от удара, давления, искры или нагрева!",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1600,
    specificHeat: 1.5,
    thermalCond: 0.12,
    flammability: 0.95,
    ignitionTempC: 145,
    burnHeat: 110,
    explosivePower: 1.35,
    detonationShockKPa: 18,
    acidResistance: 0.8,
    porosity: 0,
    viscosity: 0.22,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [232,224,168],
    accentColor: [255,248,212],
    metallic: 0.14,
    roughness: 0.07,
    opacity: 0.78,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":145,"ratePerSecond":19.95,"produce":62},
    {"note":"Детонация, мощность 1.35","trigger":"shock","minTempC":145,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
