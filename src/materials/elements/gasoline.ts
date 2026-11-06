// Элемент #29 — Бензин. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Летучее топливо (740 кг/м³). Испаряет взрывоопасные пары и мгновенно вспыхивает от искры!",
  def: {
    id: 29,
    key: "gasoline",
    name: "Бензин",
    shortDesc: "Летучее топливо (740 кг/м³). Испаряет взрывоопасные пары и мгновенно вспыхивает от искры!",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 740,
    specificHeat: 2.22,
    thermalCond: 0.09,
    boilTempC: 78,
    boilInto: 76,
    flammability: 0.92,
    ignitionTempC: 85,
    burnHeat: 68,
    explosivePower: 0.35,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.03,
    dispersion: 12,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [218,196,102],
    accentColor: [248,236,168],
    metallic: 0.14,
    roughness: 0.05,
    opacity: 0.68,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #76","trigger":"heat","minTempC":78,"ratePerSecond":0.11,"produce":76},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":85,"ratePerSecond":19.32,"produce":62},
    {"note":"Детонация, мощность 0.35","trigger":"shock","minTempC":85,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
