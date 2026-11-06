// Элемент #161 — Медный лист. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","selectable"],
  summary: "Листовая медь (8960 кг/м³). Теплопроводность 401 Вт/(м·К): мгновенно отводит жар от очага.",
  def: {
    id: 161,
    key: "copper_plate",
    name: "Медный лист",
    shortDesc: "Листовая медь (8960 кг/м³). Теплопроводность 401 Вт/(м·К): мгновенно отводит жар от очага.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 8960,
    specificHeat: 0.385,
    thermalCond: 0.98,
    meltTempC: 1085,
    meltInto: 141,
    flammability: 0,
    acidResistance: 0.35,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 620,
    elecCond: 0.99,
    elecResistanceHeat: 0.015,
    baseColor: [196,112,62],
    accentColor: [248,168,112],
    metallic: 0.95,
    roughness: 0.24,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #141","trigger":"heat","minTempC":1085,"ratePerSecond":4.8,"produce":141},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
