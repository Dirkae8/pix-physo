// Элемент #27 — Моторное масло. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Вязкое янтарное масло SAE 10W-40 (870 кг/м³). Плавает поверх воды, впитывается в песок и губку.",
  def: {
    id: 27,
    key: "motor_oil",
    name: "Моторное масло",
    shortDesc: "Вязкое янтарное масло SAE 10W-40 (870 кг/м³). Плавает поверх воды, впитывается в песок и губку.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 870,
    specificHeat: 1.95,
    thermalCond: 0.08,
    boilTempC: 360,
    boilInto: 76,
    flammability: 0.36,
    ignitionTempC: 215,
    burnHeat: 54,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.32,
    dispersion: 8,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [186,132,28],
    accentColor: [238,192,68],
    metallic: 0.15,
    roughness: 0.08,
    opacity: 0.86,
    emissive: 0,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Кипение → #76","trigger":"heat","minTempC":360,"ratePerSecond":8,"produce":76},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":215,"ratePerSecond":7.56,"produce":62},
  ],
  behavior: {
    absorbable: true,
    burnRatePerSecond: 0.5,
  },

});
