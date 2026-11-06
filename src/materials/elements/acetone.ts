// Элемент #194 — Ацетон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Ацетон (790 кг/м³). Кипит уже при 56 °C, пары тяжелее воздуха и легко воспламеняются.",
  def: {
    id: 194,
    key: "acetone",
    name: "Ацетон",
    shortDesc: "Ацетон (790 кг/м³). Кипит уже при 56 °C, пары тяжелее воздуха и легко воспламеняются.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 790,
    specificHeat: 2.2,
    thermalCond: 0.09,
    boilTempC: 56,
    boilInto: 248,
    freezeTempC: -114,
    freezeInto: 7,
    flammability: 0.96,
    ignitionTempC: 465,
    burnHeat: 96,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.035,
    dispersion: 12,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [212,226,232],
    accentColor: [240,250,255],
    metallic: 0,
    roughness: 0.05,
    opacity: 0.62,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #248","trigger":"heat","minTempC":56,"ratePerSecond":0.11,"produce":248},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-114,"produce":7},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":465,"ratePerSecond":20.16,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 10.5,
    flameColor: 1,
  },

});
