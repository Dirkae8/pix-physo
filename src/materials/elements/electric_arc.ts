// Элемент #77 — Электрическая дуга. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","energy","electric"],
  summary: "Ионизированный канал пробоя воздуха (3800 °C). Проводит ток и зажигает горючие смеси.",
  def: {
    id: 77,
    key: "electric_arc",
    name: "Электрическая дуга",
    shortDesc: "Ионизированный канал пробоя воздуха (3800 °C). Проводит ток и зажигает горючие смеси.",
    category: "electric",
    state: "energy",
    selectable: false,
    density: 0.15,
    specificHeat: 1,
    thermalCond: 0.7,
    defaultTempC: 3600,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 1,
    baseColor: [132,206,255],
    accentColor: [248,252,255],
    metallic: 0,
    roughness: 0,
    opacity: 0.98,
    emissive: 2,
    textureStyle: "plasma",
  },
  reactions: [
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
