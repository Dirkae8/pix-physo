// Элемент #212 — Хлороводород. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "HCl (1,64 кг/м³). Тяжёлый едкий газ, во влажном воздухе образует туман соляной кислоты.",
  def: {
    id: 212,
    key: "hydrogen_chloride",
    name: "Хлороводород",
    shortDesc: "HCl (1,64 кг/м³). Тяжёлый едкий газ, во влажном воздухе образует туман соляной кислоты.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 1.64,
    specificHeat: 0.8,
    thermalCond: 0.04,
    flammability: 0,
    acidResistance: 0.1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [214,220,200],
    accentColor: [240,244,228],
    metallic: 0,
    roughness: 1,
    opacity: 0.36,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
