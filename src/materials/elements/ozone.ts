// Элемент #201 — Озон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "O₃ (2,14 кг/м³). Сильный окислитель: ускоряет горение и тяжелее воздуха.",
  def: {
    id: 201,
    key: "ozone",
    name: "Озон",
    shortDesc: "O₃ (2,14 кг/м³). Сильный окислитель: ускоряет горение и тяжелее воздуха.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 2.14,
    specificHeat: 0.82,
    thermalCond: 0.05,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [116,158,226],
    accentColor: [176,206,250],
    metallic: 0,
    roughness: 1,
    opacity: 0.4,
    emissive: 0.04,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
