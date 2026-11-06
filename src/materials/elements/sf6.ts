// Элемент #214 — Элегаз SF₆. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "Гексафторид серы (6,16 кг/м³). В 5 раз тяжелее воздуха: идеален для опытов со «слоями» газа.",
  def: {
    id: 214,
    key: "sf6",
    name: "Элегаз SF₆",
    shortDesc: "Гексафторид серы (6,16 кг/м³). В 5 раз тяжелее воздуха: идеален для опытов со «слоями» газа.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 6.16,
    specificHeat: 0.66,
    thermalCond: 0.03,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [176,190,202],
    accentColor: [216,228,238],
    metallic: 0,
    roughness: 1,
    opacity: 0.3,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
