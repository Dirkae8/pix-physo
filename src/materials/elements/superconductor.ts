// Элемент #217 — Сверхпроводник. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Керамический сверхпроводник: почти нулевое сопротивление и нагрев под током.",
  def: {
    id: 217,
    key: "superconductor",
    name: "Сверхпроводник",
    shortDesc: "Керамический сверхпроводник: почти нулевое сопротивление и нагрев под током.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 6300,
    specificHeat: 0.4,
    thermalCond: 0.72,
    flammability: 0,
    acidResistance: 0.95,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 180,
    elecCond: 1,
    elecResistanceHeat: 0,
    baseColor: [76,118,152],
    accentColor: [136,196,230],
    metallic: 0.55,
    roughness: 0.3,
    opacity: 1,
    emissive: 0,
    textureStyle: "wire",
  },
  reactions: [
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
