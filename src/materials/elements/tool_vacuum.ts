// Элемент #236 — Пылесос. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","tool","tools","selectable"],
  summary: "Инструмент: откачивает газы, дым и пар, не трогая жидкости и твёрдые тела.",
  def: {
    id: 236,
    key: "tool_vacuum",
    name: "Пылесос",
    shortDesc: "Инструмент: откачивает газы, дым и пар, не трогая жидкости и твёрдые тела.",
    category: "tools",
    state: "tool",
    selectable: true,
    density: 0,
    specificHeat: 0,
    thermalCond: 0,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0,
    dispersion: 0,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [158,166,174],
    accentColor: [220,228,236],
    metallic: 0.2,
    roughness: 0.5,
    opacity: 1,
    emissive: 0.3,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },
  onBrush: (w, cx, cy, radius, forEach) => forEach(cx, cy, radius + 2, (x, y, falloff) => {
    const i = y * w.width + x;
    if (w.stateLut[w.mat[i]] === 4 || w.stateLut[w.mat[i]] === 5) {
      if (w.rand() < 0.35 + 0.6 * falloff) w.mat[i] = 0;
    }
    w.airPressure[w.airIdxFromCell(x, y)] -= 0.6 * falloff;
  }),
});
