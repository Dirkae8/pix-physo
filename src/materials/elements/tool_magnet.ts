// Элемент #235 — Магнит. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","tool","tools","selectable"],
  summary: "Инструмент: притягивает железные опилки и стальную стружку в области кисти.",
  def: {
    id: 235,
    key: "tool_magnet",
    name: "Магнит",
    shortDesc: "Инструмент: притягивает железные опилки и стальную стружку в области кисти.",
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
    baseColor: [186,190,196],
    accentColor: [238,242,248],
    metallic: 0.4,
    roughness: 0.4,
    opacity: 1,
    emissive: 0.3,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },
  onBrush: (w, cx, cy, radius, forEach) => forEach(cx, cy, radius + 8, (x, y, falloff) => {
    const i = y * w.width + x, m = w.mat[i];
    if (m !== 23 && m !== 174 && m !== 242) return;
    const dx = cx - x, dy = cy - y, len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const pull = 2.6 * falloff * Math.min(1, 8 / len);
    w.vx[i] += dx / len * pull; w.vy[i] += dy / len * pull;
  }),
});
