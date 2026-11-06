// Элемент #156 — Пробка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Пробковое дерево (240 кг/м³). Закрытые поры дают плавучесть и низкую теплопроводность.",
  def: {
    id: 156,
    key: "cork",
    name: "Пробка",
    shortDesc: "Пробковое дерево (240 кг/м³). Закрытые поры дают плавучесть и низкую теплопроводность.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 240,
    specificHeat: 1.9,
    thermalCond: 0.018,
    flammability: 0.42,
    ignitionTempC: 300,
    burnHeat: 30,
    acidResistance: 0.35,
    porosity: 0.8,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 12,
    elecCond: 0,
    baseColor: [166,122,72],
    accentColor: [204,162,108],
    metallic: 0,
    roughness: 0.95,
    opacity: 1,
    emissive: 0,
    textureStyle: "sponge",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":300,"ratePerSecond":8.82,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 143,
    sheet: true,
    burnRatePerSecond: 1.4,
    burnProduct: 74,
  },

});
