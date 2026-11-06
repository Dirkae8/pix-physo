// Элемент #219 — Керамический изолятор. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Фарфоровый изолятор. Не проводит ток, держит 1000 °C и не коротит в воде.",
  def: {
    id: 219,
    key: "ceramic_insulator",
    name: "Керамический изолятор",
    shortDesc: "Фарфоровый изолятор. Не проводит ток, держит 1000 °C и не коротит в воде.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 2400,
    specificHeat: 0.9,
    thermalCond: 0.06,
    flammability: 0,
    acidResistance: 0.98,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 140,
    elecCond: 0,
    baseColor: [226,222,210],
    accentColor: [248,246,238],
    metallic: 0,
    roughness: 0.4,
    opacity: 1,
    emissive: 0,
    textureStyle: "ceramic",
  },
  reactions: [

  ],
  behavior: {

  },

});
