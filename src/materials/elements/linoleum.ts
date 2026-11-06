// Элемент #157 — Линолеум. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Натуральный линолеум (1200 кг/м³). Упругое напольное покрытие, при нагреве размягчается и тлеет.",
  def: {
    id: 157,
    key: "linoleum",
    name: "Линолеум",
    shortDesc: "Натуральный линолеум (1200 кг/м³). Упругое напольное покрытие, при нагреве размягчается и тлеет.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1200,
    specificHeat: 1.45,
    thermalCond: 0.045,
    flammability: 0.4,
    ignitionTempC: 340,
    burnHeat: 44,
    acidResistance: 0.6,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 60,
    elecCond: 0,
    baseColor: [132,112,86],
    accentColor: [178,154,122],
    metallic: 0,
    roughness: 0.72,
    opacity: 1,
    emissive: 0,
    textureStyle: "rubber",
    meltTempC: 140,
    meltInto: 245,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":140,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":340,"ratePerSecond":8.4,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
