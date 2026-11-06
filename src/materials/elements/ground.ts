// Элемент #144 — Возврат цепи. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "phase.reactions",
  tags: ["phase.reactions","solid","electric","selectable"],
  summary: "Общий обратный контакт источника; соединение с батареей создаёт ток и нагрев цепи.",
  def: {
    id: 144,
    key: "ground",
    name: "Возврат цепи",
    shortDesc: "Общий обратный контакт источника; соединение с батареей создаёт ток и нагрев цепи.",
    category: "electric",
    state: "solid",
    selectable: true,
    density: 8960,
    specificHeat: 0.38,
    thermalCond: 0.95,
    meltTempC: 1085,
    meltInto: 141,
    flammability: 0,
    acidResistance: 0.35,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 680,
    elecCond: 0.99,
    elecResistanceHeat: 0.015,
    baseColor: [103,111,106],
    accentColor: [252,176,124],
    metallic: 0.95,
    roughness: 0.2,
    opacity: 1,
    emissive: 0,
    textureStyle: "wire",
  },
  reactions: [
    {"note":"Плавление → #141","trigger":"heat","minTempC":1085,"ratePerSecond":4.8,"produce":141},
    {"note":"Проводит электрический ток","trigger":"electric"},
  ],
  behavior: {

  },

});
