// Элемент #51 — Нихром (ТЭН). Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","electric","selectable"],
  summary: "Нагревательная спираль с высоким сопротивлением: от тока раскаляется до 1150 °C, кипятит воду и плавит!",
  def: {
    id: 51,
    key: "heater",
    name: "Нихром (ТЭН)",
    shortDesc: "Нагревательная спираль с высоким сопротивлением: от тока раскаляется до 1150 °C, кипятит воду и плавит!",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 8400,
    specificHeat: 0.45,
    thermalCond: 0.55,
    meltTempC: 1420,
    meltInto: 69,
    flammability: 0,
    acidResistance: 0.78,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 960,
    elecCond: 0.55,
    elecResistanceHeat: 1.45,
    baseColor: [164,112,96],
    accentColor: [255,138,56],
    metallic: 0.82,
    roughness: 0.34,
    opacity: 1,
    emissive: 0,
    textureStyle: "heater",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1420,"ratePerSecond":4.8,"produce":69},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
