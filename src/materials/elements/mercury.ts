// Элемент #25 — Ртуть. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","liquid","liquids","selectable"],
  summary: "Жидкий тяжёлый металл (13546 кг/м³). Проводит ток, выталкивает наверх сталь и кирпич!",
  def: {
    id: 25,
    key: "mercury",
    name: "Ртуть",
    shortDesc: "Жидкий тяжёлый металл (13546 кг/м³). Проводит ток, выталкивает наверх сталь и кирпич!",
    category: "liquids",
    state: "liquid",
    selectable: true,
    density: 13546,
    specificHeat: 0.14,
    thermalCond: 0.58,
    boilTempC: 357,
    boilInto: 41,
    freezeTempC: -39,
    freezeInto: 3,
    flammability: 0,
    acidResistance: 0.65,
    porosity: 0,
    viscosity: 0.08,
    dispersion: 10,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.92,
    baseColor: [188,198,210],
    accentColor: [245,250,255],
    metallic: 0.99,
    roughness: 0.04,
    opacity: 1,
    emissive: 0,
    textureStyle: "liquid_metal",
  },
  reactions: [
    {"note":"Кипение → #41","trigger":"heat","minTempC":357,"ratePerSecond":8,"produce":41},
    {"note":"Затвердевание → #3","trigger":"heat","minTempC":-39,"produce":3},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
