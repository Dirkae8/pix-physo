// Элемент #167 — Сухая вода. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Капли воды в оболочке из диоксида кремния. Сыпучая, но при нагреве или ударе высвобождает воду.",
  def: {
    id: 167,
    key: "dry_water",
    name: "Сухая вода",
    shortDesc: "Капли воды в оболочке из диоксида кремния. Сыпучая, но при нагреве или ударе высвобождает воду.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 900,
    specificHeat: 3.1,
    thermalCond: 0.08,
    flammability: 0,
    acidResistance: 0.9,
    porosity: 0.35,
    viscosity: 0.3,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0.02,
    baseColor: [226,232,236],
    accentColor: [248,252,255],
    metallic: 0,
    roughness: 0.8,
    opacity: 1,
    emissive: 0,
    textureStyle: "granular",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 116,
    granular: true,
  },
  onStep: (w, i, x, y, dt) => {
    const motion = w.vx[i] * w.vx[i] + w.vy[i] * w.vy[i];
    if ((w.temp[i] > 45 || w.stress[i] > 4 || motion > 9) && w.rand() < Math.min(1, 3.0 * dt)) {
      w.mat[i] = 24;
      w.temp[i] = Math.max(0, Math.min(90, w.temp[i]));
      w.vx[i] = 0; w.vy[i] = 0; w.wetness[i] = 0; w.absorbedMat[i] = 0;
    }
  },
});
