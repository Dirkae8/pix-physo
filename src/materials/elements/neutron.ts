// Элемент #61 — Нейтроны. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","energy","explosives","selectable"],
  summary: "Поток быстрых нейтронов. Прошивает стекло и воздух, отражается/гасится свинцом и взрывает Уран-235!",
  def: {
    id: 61,
    key: "neutron",
    name: "Нейтроны",
    shortDesc: "Поток быстрых нейтронов. Прошивает стекло и воздух, отражается/гасится свинцом и взрывает Уран-235!",
    category: "explosives",
    state: "energy",
    selectable: true,
    density: 0.01,
    specificHeat: 0.1,
    thermalCond: 0.1,
    defaultTempC: 180,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 12,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [92,238,255],
    accentColor: [224,255,255],
    metallic: 0,
    roughness: 0,
    opacity: 0.95,
    emissive: 1.85,
    textureStyle: "plasma",
  },
  reactions: [

  ],
  behavior: {

  },

});
