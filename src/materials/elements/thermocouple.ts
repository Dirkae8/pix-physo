// Элемент #222 — Термопара. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Термопара типа K: разность температур между соседними клетками даёт напряжение (эффект Зеебека).",
  def: {
    id: 222,
    key: "thermocouple",
    name: "Термопара",
    shortDesc: "Термопара типа K: разность температур между соседними клетками даёт напряжение (эффект Зеебека).",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 8200,
    specificHeat: 0.44,
    thermalCond: 0.3,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 300,
    elecCond: 0.6,
    baseColor: [148,152,160],
    accentColor: [204,210,218],
    metallic: 0.7,
    roughness: 0.36,
    opacity: 1,
    emissive: 0.24,
    textureStyle: "wire",
  },
  reactions: [
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },
  onVoltage: (w, i) => {
    const W = w.width, H = w.height, x = i % W, y = (i / W) | 0;
    const l = x > 0 ? w.temp[i - 1] : w.temp[i];
    const r = x + 1 < W ? w.temp[i + 1] : w.temp[i];
    const u = y > 0 ? w.temp[i - W] : w.temp[i];
    const d = y + 1 < H ? w.temp[i + W] : w.temp[i];
    return Math.min(24, (Math.abs(r - l) + Math.abs(d - u)) * 0.09);
  },
});
