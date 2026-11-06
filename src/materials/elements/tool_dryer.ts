// Элемент #238 — Сушилка. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.energy",
  tags: ["expansion.energy","tool","tools","selectable"],
  summary: "Инструмент: выпаривает влагу из пористых тел и слегка нагревает область.",
  def: {
    id: 238,
    key: "tool_dryer",
    name: "Сушилка",
    shortDesc: "Инструмент: выпаривает влагу из пористых тел и слегка нагревает область.",
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
    baseColor: [206,210,214],
    accentColor: [242,246,250],
    metallic: 0.1,
    roughness: 0.5,
    opacity: 1,
    emissive: 0.8,
    textureStyle: "tool",
  },
  reactions: [

  ],
  behavior: {

  },
  onBrush: (w, cx, cy, radius, forEach) => forEach(cx, cy, radius, (x, y, falloff) => {
    const i = y * w.width + x;
    w.temp[i] = Math.min(320, w.temp[i] + 18 * falloff);
    if (w.wetness[i] > 0) {
      w.wetness[i] = Math.max(0, w.wetness[i] - Math.round(70 * falloff));
      if (w.wetness[i] === 0) w.absorbedMat[i] = 0;
    }
    if (y > 0 && w.mat[i] === 24 && w.mat[i - w.width] === 0 && w.rand() < 0.04 * falloff) {
      w.setCell(x, y - 1, 135, w.temp[i]);
    }
  }),
});
