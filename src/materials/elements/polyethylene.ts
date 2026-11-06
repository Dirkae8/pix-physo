// Элемент #148 — Полиэтилен. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Полиэтилен низкой плотности (920 кг/м³). Всплывает в воде, плавится уже при 110 °C.",
  def: {
    id: 148,
    key: "polyethylene",
    name: "Полиэтилен",
    shortDesc: "Полиэтилен низкой плотности (920 кг/м³). Всплывает в воде, плавится уже при 110 °C.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 920,
    specificHeat: 2.3,
    thermalCond: 0.035,
    flammability: 0.7,
    ignitionTempC: 350,
    burnHeat: 70,
    acidResistance: 0.98,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 28,
    elecCond: 0,
    baseColor: [232,234,226],
    accentColor: [250,252,246],
    metallic: 0,
    roughness: 0.55,
    opacity: 0.97,
    emissive: 0,
    textureStyle: "wax",
    meltTempC: 110,
    meltInto: 245,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":110,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":350,"ratePerSecond":14.7,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
