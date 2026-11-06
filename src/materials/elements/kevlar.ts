// Элемент #149 — Кевлар. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","sheet","selectable"],
  summary: "Арамидное волокно: прочность на разрыв 3,6 ГПа при плотности 1440 кг/м³. Не плавится, не горит.",
  def: {
    id: 149,
    key: "kevlar",
    name: "Кевлар",
    shortDesc: "Арамидное волокно: прочность на разрыв 3,6 ГПа при плотности 1440 кг/м³. Не плавится, не горит.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 1440,
    specificHeat: 1.42,
    thermalCond: 0.04,
    flammability: 0,
    ignitionTempC: 285,
    burnHeat: 0,
    acidResistance: 0.9,
    porosity: 0.12,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 3600,
    elecCond: 0,
    baseColor: [196,186,92],
    accentColor: [232,222,142],
    metallic: 0,
    roughness: 0.82,
    opacity: 1,
    emissive: 0,
    textureStyle: "fibers",
  },
  reactions: [
    {"note":"Капиллярное впитывание жидкости","trigger":"contact","ratePerSecond":6},
  ],
  behavior: {
    capillary: 102,
    sheet: true,
  },

});
