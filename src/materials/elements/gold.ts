// Элемент #22 — Золото. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","powder","powders","granular","selectable"],
  summary: "Благородный металл (19320 кг/м³ — тонет даже в ртути!). Идеальный проводник, не берёт кислота.",
  def: {
    id: 22,
    key: "gold",
    name: "Золото",
    shortDesc: "Благородный металл (19320 кг/м³ — тонет даже в ртути!). Идеальный проводник, не берёт кислота.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 19320,
    specificHeat: 0.13,
    thermalCond: 0.92,
    meltTempC: 1064,
    meltInto: 119,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.4,
    dispersion: 1,
    reposeSkip: 0.25,
    tensileStrength: 0,
    elecCond: 0.98,
    baseColor: [238,192,58],
    accentColor: [255,232,132],
    metallic: 0.98,
    roughness: 0.16,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Плавление → #119","trigger":"heat","minTempC":1064,"ratePerSecond":4.8,"produce":119},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    granular: true,
  },

});
