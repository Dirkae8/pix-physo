// Элемент #229 — Пикриновая кислота. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","explosives","granular","selectable"],
  summary: "Тринитрофенол. Кристаллическое ВВ, чувствительное к удару и трению.",
  def: {
    id: 229,
    key: "picric_acid",
    name: "Пикриновая кислота",
    shortDesc: "Тринитрофенол. Кристаллическое ВВ, чувствительное к удару и трению.",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1760,
    specificHeat: 1.1,
    thermalCond: 0.08,
    flammability: 0.72,
    ignitionTempC: 300,
    burnHeat: 124,
    explosivePower: 1.5,
    detonationShockKPa: 28,
    acidResistance: 0.3,
    porosity: 0,
    viscosity: 0.4,
    dispersion: 1,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [214,188,62],
    accentColor: [246,224,112],
    metallic: 0,
    roughness: 0.55,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":300,"ratePerSecond":15.12,"produce":62},
    {"note":"Детонация, мощность 1.5","trigger":"shock","minTempC":300,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
