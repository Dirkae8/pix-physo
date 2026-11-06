// Элемент #185 — Соевый соус. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Ферментированный рассол (1120 кг/м³). Много соли — плотнее воды и хорошо проводит ток.",
  def: {
    id: 185,
    key: "soy_sauce",
    name: "Соевый соус",
    shortDesc: "Ферментированный рассол (1120 кг/м³). Много соли — плотнее воды и хорошо проводит ток.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1120,
    specificHeat: 3.5,
    thermalCond: 0.23,
    boilTempC: 101,
    boilInto: 246,
    freezeTempC: -5,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 0.8,
    porosity: 0,
    viscosity: 0.08,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.55,
    baseColor: [62,34,24],
    accentColor: [122,70,44],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.9,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":101,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-5,"produce":7},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
  },

});
