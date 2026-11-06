// Элемент #46 — Аккумулятор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Литий-ионный аккумулятор (24 В). Питает цепи, заряжается от генератора, взрывается при перегреве >165 °C!",
  def: {
    id: 46,
    key: "battery",
    name: "Аккумулятор",
    shortDesc: "Литий-ионный аккумулятор (24 В). Питает цепи, заряжается от генератора, взрывается при перегреве >165 °C!",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 2650,
    specificHeat: 0.95,
    thermalCond: 0.25,
    flammability: 0.35,
    ignitionTempC: 165,
    burnHeat: 95,
    explosivePower: 0.85,
    acidResistance: 0.3,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 420,
    elecCond: 0.92,
    baseColor: [28,148,106],
    accentColor: [242,188,56],
    metallic: 0.65,
    roughness: 0.28,
    opacity: 1,
    emissive: 0.18,
    textureStyle: "battery",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":165,"ratePerSecond":7.35,"produce":62},
    {"note":"Детонация, мощность 0.85","trigger":"shock","minTempC":165,"ratePerSecond":0,"produce":63},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
