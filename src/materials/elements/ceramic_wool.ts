// Элемент #159 — Огнеупорная вата. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Керамическое волокно (130 кг/м³). Выдерживает 1400 °C, почти не проводит тепло, гасит пламя.",
  def: {
    id: 159,
    key: "ceramic_wool",
    name: "Огнеупорная вата",
    shortDesc: "Керамическое волокно (130 кг/м³). Выдерживает 1400 °C, почти не проводит тепло, гасит пламя.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 130,
    specificHeat: 1.05,
    thermalCond: 0.012,
    flammability: 0,
    acidResistance: 0.99,
    porosity: 0.88,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 6,
    elecCond: 0,
    baseColor: [232,230,224],
    accentColor: [248,246,240],
    metallic: 0,
    roughness: 0.98,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
    burnHeat: 0,
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 148,
    sheet: true,
  },

});
