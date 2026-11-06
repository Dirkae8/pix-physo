// Элемент #187 — Красное вино. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Сухое вино (990 кг/м³), ~12 % спирта. Легче воды, пары горючие.",
  def: {
    id: 187,
    key: "red_wine",
    name: "Красное вино",
    shortDesc: "Сухое вино (990 кг/м³), ~12 % спирта. Легче воды, пары горючие.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 990,
    specificHeat: 3.9,
    thermalCond: 0.2,
    boilTempC: 96,
    boilInto: 246,
    freezeTempC: -5,
    freezeInto: 7,
    flammability: 0.22,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.05,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.18,
    baseColor: [92,24,40],
    accentColor: [156,48,68],
    metallic: 0,
    roughness: 0.08,
    opacity: 0.86,
    emissive: 0,
    textureStyle: "liquid_clear",
    ignitionTempC: 340,
    burnHeat: 34,
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":96,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-5,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":340,"ratePerSecond":4.62,"produce":62},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
    burnRatePerSecond: 10.5,
  },

});
