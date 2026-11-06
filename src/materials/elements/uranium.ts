// Элемент #60 — Уран-235. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","solid","explosives","selectable"],
  summary: "Делящийся изотоп (19100 кг/м³). При попадании нейтронов или обжатии запускает ядерную цепную реакцию!",
  def: {
    id: 60,
    key: "uranium",
    name: "Уран-235",
    shortDesc: "Делящийся изотоп (19100 кг/м³). При попадании нейтронов или обжатии запускает ядерную цепную реакцию!",
    category: "explosives",
    state: "solid",
    selectable: true,
    density: 19100,
    specificHeat: 0.12,
    thermalCond: 0.42,
    defaultTempC: 48,
    meltTempC: 1132,
    meltInto: 69,
    flammability: 0,
    explosivePower: 2.8,
    acidResistance: 0.45,
    porosity: 0,
    viscosity: 1,
    dispersion: 0,
    reposeSkip: 1,
    tensileStrength: 1200,
    elecCond: 0.48,
    baseColor: [78,158,72],
    accentColor: [168,255,112],
    metallic: 0.85,
    roughness: 0.28,
    opacity: 1,
    emissive: 0.55,
    textureStyle: "radioactive",
  },
  reactions: [
    {"note":"Плавление → #69","trigger":"heat","minTempC":1132,"ratePerSecond":4.8,"produce":69},
    {"note":"Детонация, мощность 2.8","trigger":"shock","ratePerSecond":0,"produce":63},
  ],
  behavior: {
    selfOxidizer: true,
  },

});
