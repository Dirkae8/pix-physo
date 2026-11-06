// Элемент #221 — Пьезоэлемент. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","solid","electric","selectable"],
  summary: "Пьезокерамика: механическое напряжение от удара или веса превращает в напряжение до 24 В.",
  def: {
    id: 221,
    key: "piezo",
    name: "Пьезоэлемент",
    shortDesc: "Пьезокерамика: механическое напряжение от удара или веса превращает в напряжение до 24 В.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 7700,
    specificHeat: 0.42,
    thermalCond: 0.14,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 120,
    elecCond: 0.55,
    elecResistanceHeat: 0.015,
    baseColor: [186,176,148],
    accentColor: [226,218,190],
    metallic: 0.4,
    roughness: 0.5,
    opacity: 1,
    emissive: 0,
    textureStyle: "battery",
  },
  reactions: [
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },
  onVoltage: (w, i) => {
    const load = w.stress[i] + Math.abs(w.airPressure[w.airIdxFromCell(i % w.width, (i / w.width) | 0)]) * 0.12;
    return Math.min(24, load * 1.35);
  },
});
