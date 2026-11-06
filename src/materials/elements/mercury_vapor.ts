// Элемент #243 — Пары ртути. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","gas","gases","selectable"],
  summary: "Тяжёлые пары Hg. Оседают вниз, конденсируются на холодных поверхностях.",
  def: {
    id: 243,
    key: "mercury_vapor",
    name: "Пары ртути",
    shortDesc: "Тяжёлые пары Hg. Оседают вниз, конденсируются на холодных поверхностях.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 6.5,
    specificHeat: 0.14,
    thermalCond: 0.03,
    defaultTempC: 118,
    freezeTempC: 300,
    freezeInto: 25,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 0.01,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.05,
    baseColor: [178,190,198],
    accentColor: [222,232,240],
    metallic: 0.2,
    roughness: 1,
    opacity: 0.42,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Затвердевание → #25","trigger":"heat","minTempC":300,"produce":25},
  ],
  behavior: {

  },

});
