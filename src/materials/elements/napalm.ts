// Элемент #59 — Напалм. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","explosives","selectable"],
  summary: "Загущённая огнесмесь (920 кг/м³). Прилипает к поверхностям, плавает в воде и долго горит при 1200 °C.",
  def: {
    id: 59,
    key: "napalm",
    name: "Напалм",
    shortDesc: "Загущённая огнесмесь (920 кг/м³). Прилипает к поверхностям, плавает в воде и долго горит при 1200 °C.",
    category: "explosives",
    state: "liquid",
    selectable: true,
    density: 920,
    specificHeat: 1.85,
    thermalCond: 0.1,
    flammability: 0.85,
    ignitionTempC: 115,
    burnHeat: 115,
    acidResistance: 0.65,
    porosity: 0,
    viscosity: 0.68,
    dispersion: 4,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0,
    baseColor: [232,118,28],
    accentColor: [255,198,78],
    metallic: 0.1,
    roughness: 0.15,
    opacity: 0.9,
    emissive: 0.12,
    textureStyle: "liquid_oil",
  },
  reactions: [
    {"note":"Возгорание с образованием пламени","trigger":"ignite","minTempC":115,"ratePerSecond":17.849999999999998,"produce":62},
  ],
  behavior: {
    burnRatePerSecond: 0.5,
  },

});
