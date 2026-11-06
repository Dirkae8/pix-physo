// Элемент #152 — Пенопласт. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Вспененный полистирол (30 кг/м³): 98 % воздуха. Отличный теплоизолятор, плавится и дымит.",
  def: {
    id: 152,
    key: "styrofoam",
    name: "Пенопласт",
    shortDesc: "Вспененный полистирол (30 кг/м³): 98 % воздуха. Отличный теплоизолятор, плавится и дымит.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 30,
    specificHeat: 1.3,
    thermalCond: 0.012,
    flammability: 0.7,
    ignitionTempC: 330,
    burnHeat: 58,
    acidResistance: 0.8,
    porosity: 0.9,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 3,
    elecCond: 0,
    baseColor: [240,240,236],
    accentColor: [252,252,250],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "sponge",
    meltTempC: 100,
    meltInto: 245,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":100,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":330,"ratePerSecond":14.7,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 149,
    sheet: true,
    burnRatePerSecond: 3,
    burnProduct: 249,
  },

});
