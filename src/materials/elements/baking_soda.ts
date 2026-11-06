// Элемент #178 — Пищевая сода. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.powders",
  tags: ["expansion.powders","powder","powders","granular","selectable"],
  summary: "Гидрокарбонат натрия (2200 кг/м³). С кислотой и уксусом бурно выделяет CO₂ и гасит пламя.",
  def: {
    id: 178,
    key: "baking_soda",
    name: "Пищевая сода",
    shortDesc: "Гидрокарбонат натрия (2200 кг/м³). С кислотой и уксусом бурно выделяет CO₂ и гасит пламя.",
    category: "powders",
    state: "powder",
    selectable: true,
    density: 2200,
    specificHeat: 1.05,
    thermalCond: 0.05,
    flammability: 0,
    acidResistance: 0.1,
    porosity: 0.3,
    waterSoluble: true,
    viscosity: 0.3,
    dispersion: 4,
    reposeSkip: 0.2,
    tensileStrength: 0,
    elecCond: 0.06,
    baseColor: [246,246,242],
    accentColor: [255,255,252],
    metallic: 0,
    roughness: 0.9,
    opacity: 1,
    emissive: 0,
    textureStyle: "crystal",
  },
  reactions: [
    {"note":"Растворение в воде","trigger":"wet","with":[24],"ratePerSecond":2.7,"produce":71},
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 113,
    carbonate: true,
    granular: true,
  },
  onStep: (w, i, x, y) => {
    const W = w.width, H = w.height;
    const ns = [i - W, i - 1, i + 1, i + W];
    const ok = [y > 0, x > 0, x + 1 < W, y + 1 < H];
    for (let d = 0; d < 4; d++) {
      if (!ok[d]) continue;
      const j = ns[d], mj = w.mat[j];
      if (mj === 30 || mj === 184) {
        w.mat[i] = 42; w.wetness[i] = 150;
        w.temp[i] = Math.max(-20, w.temp[i] - 3);
        w.mat[j] = 71; w.temp[j] += 4;
        w.airPressure[w.airIdxFromCell(x, y)] += 0.35;
        w.events.sizzleCount++;
        return;
      }
    }
  },
});
