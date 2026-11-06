// Элемент #43 — Хлор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Тяжёлый ядовито-зелёный газ Cl₂ (3.2 кг/м³). Стелется у земли, взрывается с водородом и разъедает металл.",
  def: {
    id: 43,
    key: "chlorine",
    name: "Хлор",
    shortDesc: "Тяжёлый ядовито-зелёный газ Cl₂ (3.2 кг/м³). Стелется у земли, взрывается с водородом и разъедает металл.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 3.21,
    specificHeat: 0.48,
    thermalCond: 0.04,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.04,
    dispersion: 6,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [164,218,72],
    accentColor: [212,248,128],
    metallic: 0,
    roughness: 1,
    opacity: 0.46,
    emissive: 0.06,
    textureStyle: "gas",
  },
  reactions: [

  ],
  behavior: {

  },

});
