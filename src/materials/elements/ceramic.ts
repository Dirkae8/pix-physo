// Элемент #10 — Керамика. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Огнеупорная шамотно-циркониевая теплоизоляция (до 2700 °C) и изолятор.",
  def: {
    id: 10,
    key: "ceramic",
    name: "Керамика",
    shortDesc: "Огнеупорная шамотно-циркониевая теплоизоляция (до 2700 °C) и изолятор.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 3200,
    specificHeat: 1.1,
    thermalCond: 0.008,
    meltTempC: 2700,
    meltInto: 26,
    flammability: 0,
    acidResistance: 0.99,
    porosity: 0.03,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 480,
    elecCond: 0,
    baseColor: [230,224,212],
    accentColor: [195,186,170],
    metallic: 0.06,
    roughness: 0.42,
    opacity: 1,
    emissive: 0,
    textureStyle: "ceramic",
  },
  reactions: [
    {"note":"Плавление → #26","trigger":"heat","minTempC":2700,"ratePerSecond":4.8,"produce":26},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 97,
  },

});
