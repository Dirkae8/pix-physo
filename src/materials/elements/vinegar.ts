// Элемент #184 — Уксус 9 %. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.fluids",
  tags: ["expansion.fluids","liquid","liquids","selectable"],
  summary: "Водный раствор уксусной кислоты (1010 кг/м³). С содой даёт бурную пену CO₂.",
  def: {
    id: 184,
    key: "vinegar",
    name: "Уксус 9 %",
    shortDesc: "Водный раствор уксусной кислоты (1010 кг/м³). С содой даёт бурную пену CO₂.",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 1010,
    specificHeat: 3.95,
    thermalCond: 0.21,
    boilTempC: 100,
    boilInto: 246,
    freezeTempC: -3,
    freezeInto: 7,
    flammability: 0,
    acidResistance: 0.7,
    porosity: 0,
    viscosity: 0.05,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.3,
    baseColor: [198,190,146],
    accentColor: [232,226,190],
    metallic: 0,
    roughness: 0.1,
    opacity: 0.78,
    emissive: 0,
    textureStyle: "liquid_clear",
  },
  reactions: [
    {"note":"Кипение → #246","trigger":"heat","minTempC":100,"ratePerSecond":0.11,"produce":246},
    {"note":"Затвердевание → #7","trigger":"heat","minTempC":-3,"produce":7},
  ],
  behavior: {
    smothers: true,
    aqueous: true,
    absorbable: true,
  },
  onStep: (w, i, x, y) => {
    const W = w.width, H = w.height;
    const ns = [i - W, i - 1, i + 1, i + W];
    const ok = [y > 0, x > 0, x + 1 < W, y + 1 < H];
    for (let d = 0; d < 4; d++) {
      if (!ok[d]) continue;
      const j = ns[d], mj = w.mat[j];
      if (mj === 178 || mj === 30) {
        w.mat[i] = 42; w.wetness[i] = 150;
        w.mat[j] = 71; w.temp[j] += 4;
        w.airPressure[w.airIdxFromCell(x, y)] += 0.35;
        w.events.sizzleCount++;
        return;
      }
    }
  },
});
