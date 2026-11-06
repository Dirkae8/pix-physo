// Элемент #234 — Пиротехническая смесь. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","powder","explosives","granular","selectable"],
  summary: "Окислитель + металлическое горючее. Яркая медленная вспышка с искрами, а не фугасный взрыв.",
  def: {
    id: 234,
    key: "pyro_mix",
    name: "Пиротехническая смесь",
    shortDesc: "Окислитель + металлическое горючее. Яркая медленная вспышка с искрами, а не фугасный взрыв.",
    category: "explosives",
    state: "powder",
    selectable: true,
    density: 1900,
    specificHeat: 1.05,
    thermalCond: 0.09,
    flammability: 0.98,
    ignitionTempC: 240,
    burnHeat: 210,
    explosivePower: 0.42,
    acidResistance: 0.3,
    porosity: 0.2,
    viscosity: 0.3,
    dispersion: 2,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [128,126,122],
    accentColor: [188,186,180],
    metallic: 0.4,
    roughness: 0.7,
    opacity: 1,
    emissive: 0.25,
    textureStyle: "granular",
    detonationShockKPa: 24,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":240,"ratePerSecond":20.58,"produce":62},
    {"note":"Детонация, мощность 0.42","trigger":"shock","minTempC":240,"ratePerSecond":0,"produce":63},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 107,
    selfOxidizer: true,
    granular: true,
    burnRatePerSecond: 10.5,
    flameColor: 2,
  },

});
