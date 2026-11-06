// Элемент #57 — Пластит C-4. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","explosives","selectable"],
  summary: "Пластическая взрывчатка: не боится обычного огня, но сокрушительно детонирует от электродетонатора или искры!",
  def: {
    id: 57,
    key: "c4",
    name: "Пластит C-4",
    shortDesc: "Пластическая взрывчатка: не боится обычного огня, но сокрушительно детонирует от электродетонатора или искры!",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1720,
    specificHeat: 1.25,
    thermalCond: 0.07,
    flammability: 0.04,
    ignitionTempC: 520,
    explosivePower: 2.15,
    detonationShockKPa: 75,
    acidResistance: 0.85,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 220,
    elecCond: 0.12,
    baseColor: [216,214,198],
    accentColor: [74,102,78],
    metallic: 0.04,
    roughness: 0.56,
    opacity: 1,
    emissive: 0,
    textureStyle: "c4",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":520,"ratePerSecond":0.84,"produce":62},
    {"note":"Детонация, мощность 2.15","trigger":"shock","minTempC":520,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
