// Элемент #237 — Молот. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","tool","tools","selectable"],
  summary: "Инструмент: бьёт по твёрдым телам, накапливая напряжение до разрушения по прочности.",
  def: {
    id: 237,
    key: "tool_hammer",
    name: "Молот",
    shortDesc: "Инструмент: бьёт по твёрдым телам, накапливая напряжение до разрушения по прочности.",
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
    baseColor: [198,198,198],
    accentColor: [240,240,240],
    metallic: 0.5,
    roughness: 0.4,
    opacity: 1,
    emissive: 0.3,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },
  onBrush: (w, cx, cy, radius, forEach) => forEach(cx, cy, radius, (x, y, falloff) => {
    const i = y * w.width + x, m = w.mat[i];
    if (w.stateLut[m] !== 1) return;
    w.stress[i] += 55 * falloff;
    if (w.stress[i] > w.tensileLut[m] && w.rand() < 0.35 * falloff) {
      w.fractureCell(i, x - cx, y - cy, Math.max(1, Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)), 1.2 * falloff);
      w.stress[i] = 0;
    }
  }),
});
