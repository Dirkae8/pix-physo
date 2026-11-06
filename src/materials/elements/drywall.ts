// Элемент #158 — Гипсокартон. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Гипсовый сердечник в картоне (800 кг/м³). Крошится от удара, но держит огонь благодаря воде в кристаллах.",
  def: {
    id: 158,
    key: "drywall",
    name: "Гипсокартон",
    shortDesc: "Гипсовый сердечник в картоне (800 кг/м³). Крошится от удара, но держит огонь благодаря воде в кристаллах.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 800,
    specificHeat: 1.1,
    thermalCond: 0.055,
    flammability: 0.06,
    acidResistance: 0.18,
    porosity: 0.3,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 42,
    elecCond: 0,
    baseColor: [214,212,204],
    accentColor: [238,236,230],
    metallic: 0,
    roughness: 0.92,
    opacity: 1,
    emissive: 0,
    textureStyle: "concrete",
    ignitionTempC: 520,
    burnHeat: 12,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":520,"ratePerSecond":1.26,"produce":62},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 113,
    sheet: true,
    burnRatePerSecond: 10.5,
  },

});
