// Элемент #246 — Пар бульона. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","gas","gases"],
  summary: "Водяной пар с летучими ароматическими веществами.",
  def: {
    id: 246,
    key: "broth_vapor",
    name: "Пар бульона",
    shortDesc: "Водяной пар с летучими ароматическими веществами.",
    category: "gases",
    state: "gas",
    selectable: false,
    density: 0.62,
    specificHeat: 2,
    thermalCond: 0.05,
    defaultTempC: 105,
    freezeTempC: 96,
    freezeInto: 181,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [216,216,202],
    accentColor: [242,242,232],
    metallic: 0,
    roughness: 1,
    opacity: 0.34,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Затвердевание → #181","trigger":"heat","minTempC":96,"produce":181},
  ],
  behavior: {

  },

});
