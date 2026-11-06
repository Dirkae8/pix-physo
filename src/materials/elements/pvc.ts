// Элемент #147 — ПВХ. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Поливинилхлорид (1400 кг/м³). Плотнее воды, стоек к кислоте, при горении выделяет хлороводород.",
  def: {
    id: 147,
    key: "pvc",
    name: "ПВХ",
    shortDesc: "Поливинилхлорид (1400 кг/м³). Плотнее воды, стоек к кислоте, при горении выделяет хлороводород.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1400,
    specificHeat: 1.1,
    thermalCond: 0.038,
    flammability: 0.3,
    ignitionTempC: 455,
    burnHeat: 38,
    acidResistance: 0.96,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 130,
    elecCond: 0,
    baseColor: [176,186,190],
    accentColor: [220,230,232],
    metallic: 0,
    roughness: 0.5,
    opacity: 1,
    emissive: 0,
    textureStyle: "rubber",
    meltTempC: 160,
    meltInto: 245,
  },
  reactions: [
    {"note":"Плавление → #245","trigger":"heat","minTempC":160,"ratePerSecond":4.8,"produce":245},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":455,"ratePerSecond":6.3,"produce":62},
  ],
  behavior: {
    sheet: true,
    burnRatePerSecond: 10.5,
    burnProduct: 249,
  },

});
