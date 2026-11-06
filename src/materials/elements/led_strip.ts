// Элемент #223 — Светодиодная лента. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Светодиоды на гибкой подложке. Светится при напряжении и почти не греется.",
  def: {
    id: 223,
    key: "led_strip",
    name: "Светодиодная лента",
    shortDesc: "Светодиоды на гибкой подложке. Светится при напряжении и почти не греется.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 1400,
    specificHeat: 1.2,
    thermalCond: 0.08,
    flammability: 0.12,
    acidResistance: 0.8,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 40,
    elecCond: 0.65,
    elecResistanceHeat: 0.08,
    baseColor: [226,232,236],
    accentColor: [250,252,255],
    metallic: 0.1,
    roughness: 0.4,
    opacity: 1,
    emissive: 0.9,
    textureStyle: "lamp",
    ignitionTempC: 380,
    burnHeat: 16,
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":380,"ratePerSecond":2.52,"produce":62},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {
    burnRatePerSecond: 10.5,
  },

});
