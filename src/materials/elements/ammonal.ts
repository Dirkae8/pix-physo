// Элемент #225 — Аммонал. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","explosives","granular","selectable"],
  summary: "Смесь аммиачной селитры и алюминия. Мощная фугасная волна с яркой вспышкой.",
  def: {
    id: 225,
    key: "ammonal",
    name: "Аммонал",
    shortDesc: "Смесь аммиачной селитры и алюминия. Мощная фугасная волна с яркой вспышкой.",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 1600,
    specificHeat: 1.1,
    thermalCond: 0.08,
    flammability: 0.7,
    ignitionTempC: 300,
    burnHeat: 130,
    explosivePower: 1.4,
    detonationShockKPa: 45,
    acidResistance: 0.5,
    porosity: 0.15,
    viscosity: 0.4,
    dispersion: 1,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [176,178,168],
    accentColor: [220,222,212],
    metallic: 0.2,
    roughness: 0.8,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":300,"ratePerSecond":14.7,"produce":62},
    {"note":"Детонация, мощность 1.4","trigger":"shock","minTempC":300,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 104,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
