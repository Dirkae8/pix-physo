// Элемент #228 — Азид свинца. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","explosives","granular","selectable"],
  summary: "Pb(N₃)₂ — капсюльный инициатор. Чувствителен к удару, передаёт детонацию основному заряду.",
  def: {
    id: 228,
    key: "lead_azide",
    name: "Азид свинца",
    shortDesc: "Pb(N₃)₂ — капсюльный инициатор. Чувствителен к удару, передаёт детонацию основному заряду.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 4710,
    specificHeat: 0.45,
    thermalCond: 0.06,
    flammability: 0.9,
    ignitionTempC: 330,
    burnHeat: 96,
    explosivePower: 1.25,
    acidResistance: 0.35,
    porosity: 0.1,
    viscosity: 0.3,
    dispersion: 2,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [214,212,202],
    accentColor: [240,238,230],
    metallic: 0.25,
    roughness: 0.65,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
    detonationShockKPa: 12,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":330,"ratePerSecond":18.900000000000002,"produce":62},
    {"note":"Детонация, мощность 1.25","trigger":"shock","minTempC":330,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 101,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
  },

});
