// Элемент #40 — Пар. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: "core.materials",
  tags: ["core.materials","gas","gases","selectable"],
  summary: "Горячий водяной пар (115 °C). Повышает давление в котлах и конденсируется обратно в воду на холоде.",
  def: {
    id: 40,
    key: "steam",
    name: "Пар",
    shortDesc: "Горячий водяной пар (115 °C). Повышает давление в котлах и конденсируется обратно в воду на холоде.",
    category: "gases",
    state: "gas",
    selectable: true,
    density: 0.59,
    specificHeat: 2.08,
    thermalCond: 0.09,
    defaultTempC: 118,
    freezeTempC: 92,
    freezeInto: 24,
    flammability: 0,
    acidResistance: 1,
    porosity: 0,
    viscosity: 0.02,
    dispersion: 7,
    reposeSkip: 0,
    tensileStrength: 0,
    elecCond: 0.02,
    baseColor: [212,226,238],
    accentColor: [244,250,255],
    metallic: 0,
    roughness: 1,
    opacity: 0.44,
    emissive: 0,
    textureStyle: "gas",
  },
  reactions: [
    {"note":"Затвердевание → #24","trigger":"heat","minTempC":92,"produce":24},
  ],
  behavior: {

  },

});
