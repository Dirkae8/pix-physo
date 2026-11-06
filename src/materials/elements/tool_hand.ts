// Элемент #64 — Рука (Захват). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","tool","tools","selectable"],
  summary: "Хватайте конструкции мышью, тяните с усилием, вырывайте и ломайте куски пикселей, швыряйте предметы!",
  def: {
    id: 64,
    key: "tool_hand",
    name: "Рука (Захват)",
    shortDesc: "Хватайте конструкции мышью, тяните с усилием, вырывайте и ломайте куски пикселей, швыряйте предметы!",
    category: "tools",
    state: "tool",
    selectable: true,
    density: 0,
    specificHeat: 1,
    thermalCond: 0,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 0,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [242,188,146],
    accentColor: [56,189,248],
    metallic: 0.1,
    roughness: 0.5,
    opacity: 1,
    emissive: 0,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },

});
