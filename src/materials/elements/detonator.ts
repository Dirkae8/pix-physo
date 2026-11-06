// Элемент #54 — Электродетонатор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Капсюль-детонатор: при подаче тока создаёт ударный импульс и подрывает C4, тротил и порох!",
  def: {
    id: 54,
    key: "detonator",
    name: "Электродетонатор",
    shortDesc: "Капсюль-детонатор: при подаче тока создаёт ударный импульс и подрывает C4, тротил и порох!",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 4600,
    specificHeat: 0.6,
    thermalCond: 0.3,
    flammability: 0.2,
    ignitionTempC: 360,
    explosivePower: 0.65,
    acidResistance: 0.4,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 340,
    elecCond: 0.88,
    baseColor: [212,82,36],
    accentColor: [255,214,72],
    metallic: 0.76,
    roughness: 0.28,
    opacity: 1,
    emissive: 0.15,
    textureStyle: "detonator",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":360,"ratePerSecond":4.2,"produce":62},
    {"note":"Детонация, мощность 0.65","trigger":"shock","minTempC":360,"ratePerSecond":0,"produce":63},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
