// Элемент #163 — Чугун. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "expansion.solids",
  tags: ["expansion.solids","solid","solids","selectable"],
  summary: "Серый чугун (7200 кг/м³). Твёрдый, но хрупкий: держит сжатие, раскалывается от ударной волны.",
  def: {
    id: 163,
    key: "cast_iron",
    name: "Чугун",
    shortDesc: "Серый чугун (7200 кг/м³). Твёрдый, но хрупкий: держит сжатие, раскалывается от ударной волны.",
    category: "solids",
    state: "solid",
    selectable: true,
    density: 7200,
    specificHeat: 0.5,
    thermalCond: 0.48,
    meltTempC: 1200,
    meltInto: 122,
    flammability: 0,
    acidResistance: 0.2,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 240,
    elecCond: 0.35,
    elecResistanceHeat: 0.06,
    baseColor: [92,94,98],
    accentColor: [154,158,164],
    metallic: 0.85,
    roughness: 0.62,
    opacity: 1,
    emissive: 0,
    textureStyle: "brushed_metal",
  },
  reactions: [
    {"note":"Плавление → #122","trigger":"heat","minTempC":1200,"ratePerSecond":4.8,"produce":122},
  ],
  behavior: {

  },

});
