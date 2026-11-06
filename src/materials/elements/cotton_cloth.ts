// Элемент #155 — Хлопковая ткань. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Плотная ткань (500 кг/м³). Сильно впитывает жидкость и очень быстро распространяет пламя.",
  def: {
    id: 155,
    key: "cotton_cloth",
    name: "Хлопковая ткань",
    shortDesc: "Плотная ткань (500 кг/м³). Сильно впитывает жидкость и очень быстро распространяет пламя.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 500,
    specificHeat: 1.35,
    thermalCond: 0.04,
    flammability: 0.95,
    ignitionTempC: 210,
    burnHeat: 28,
    acidResistance: 0.14,
    porosity: 0.85,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 14,
    elecCond: 0,
    baseColor: [228,224,214],
    accentColor: [248,246,238],
    metallic: 0,
    roughness: 0.93,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":210,"ratePerSecond":19.95,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 140,
    sheet: true,
    burnRatePerSecond: 6,
    burnProduct: 250,
  },

});
