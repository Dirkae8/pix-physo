// Элемент #31 — Жидкий азот. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Криогенная жидкость (-196 °C). Мгновенно замораживает воду и лаву, кипит при комнатной температуре!",
  def: {
    id: 31,
    key: "liquid_nitrogen",
    name: "Жидкий азот",
    shortDesc: "Криогенная жидкость (-196 °C). Мгновенно замораживает воду и лаву, кипит при комнатной температуре!",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 807,
    specificHeat: 2.04,
    thermalCond: 0.32,
    defaultTempC: -196,
    boilTempC: -185,
    boilInto: 42,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 12,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [168,232,255],
    accentColor: [238,252,255],
    metallic: 0.08,
    roughness: 0.04,
    opacity: 0.62,
    emissive: 0.12,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #42","trigger":"heat","minTempC":-185,"ratePerSecond":0.11,"produce":42},
  ],
  behavior: {
    smothers: true,
  },

});
