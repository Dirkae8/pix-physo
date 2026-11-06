// Элемент #143 — Баллон CO₂. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","solids","selectable"],
  summary: "Баллон с запасом сжатого CO₂; нажмите, чтобы открыть вентиль.",
  def: {
    id: 143,
    key: "gas_cylinder",
    name: "Баллон CO₂",
    shortDesc: "Баллон с запасом сжатого CO₂; нажмите, чтобы открыть вентиль.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 7850,
    specificHeat: 0.49,
    thermalCond: 0.62,
    flammability: 0,
    acidResistance: 0.25,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 1350,
    elecCond: 0.78,
    elecResistanceHeat: 0.06,
    baseColor: [130,145,151],
    accentColor: [222,230,240],
    metallic: 0.92,
    roughness: 0.26,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
