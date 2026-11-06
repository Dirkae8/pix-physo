// Элемент #5 — Титан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","solids","selectable"],
  summary: "Броневой авиационный сплав. Выдерживает кислоту, взрывы и экстремальное давление.",
  def: {
    id: 5,
    key: "titanium",
    name: "Титан",
    shortDesc: "Броневой авиационный сплав. Выдерживает кислоту, взрывы и экстремальное давление.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 4506,
    specificHeat: 0.52,
    thermalCond: 0.28,
    meltTempC: 1668,
    meltInto: 121,
    flammability: 0,
    acidResistance: 0.98,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 2800,
    elecCond: 0.42,
    baseColor: [118,128,142],
    accentColor: [195,206,220],
    metallic: 0.95,
    roughness: 0.22,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #121","trigger":"heat","minTempC":1668,"ratePerSecond":4.8,"produce":121},
  ],
  behavior: {

  },

});
