// Элемент #211 — Пары кислоты. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","gas","gases","selectable"],
  summary: "Коррозионно-активные пары. Разъедают металлы и органику, тяжелее воздуха.",
  def: {
    id: 211,
    key: "acid_fumes",
    name: "Пары кислоты",
    shortDesc: "Коррозионно-активные пары. Разъедают металлы и органику, тяжелее воздуха.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 2.2,
    specificHeat: 0.8,
    thermalCond: 0.04,
    flammability: 0,
    acidResistance: 0.1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [198,214,118],
    accentColor: [230,242,170],
    metallic: 0,
    roughness: 1,
    opacity: 0.4,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
