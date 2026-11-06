// Элемент #233 — Нитрометан. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","liquid","explosives","selectable"],
  summary: "Жидкое топливо-окислитель (1137 кг/м³). Детонирует от сильного удара, чувствителен к примесям.",
  def: {
    id: 233,
    key: "nitromethane",
    name: "Нитрометан",
    shortDesc: "Жидкое топливо-окислитель (1137 кг/м³). Детонирует от сильного удара, чувствителен к примесям.",
    category: "explosives",
    state: "liquid",
    selectable: true,
    density: 1137,
    specificHeat: 1.7,
    thermalCond: 0.09,
    flammability: 0.9,
    ignitionTempC: 315,
    burnHeat: 128,
    explosivePower: 1.6,
    detonationShockKPa: 30,
    acidResistance: 0.5,
    porosity: 0,
    viscosity: 0.08,
    dispersion: 9,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [190,208,210],
    accentColor: [226,238,240],
    metallic: 0,
    roughness: 0.08,
    opacity: 0.82,
    emissive: 0,
    textureStyle: "liquid_clear",
    boilTempC: 101,
    boilInto: 248,
  },
  reactions: [
    {"note":"Кипение → #248","trigger":"heat","minTempC":101,"ratePerSecond":0.11,"produce":248},
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":315,"ratePerSecond":18.900000000000002,"produce":62},
    {"note":"Детонация, мощность 1.6","trigger":"shock","minTempC":315,"ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
    burnRatePerSecond: 10.5,
  },

});
