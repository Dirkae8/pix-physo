/**
 * Генератор модульной архитектуры каталога.
 *
 * 1. Собирает уже разрешённый реестр (esbuild + dump-materials.ts) в JSON.
 * 2. Проводит аудит КАЖДОГО элемента: состояние/категория/текстура/поведение.
 * 3. Пишет отдельный .ts-файл на каждый элемент: полные характеристики,
 *    реакции, поведение и (для особых веществ) исполняемые хуки.
 * 4. Пишет баррель elements/index.ts, манифесты модов и новый registry.ts.
 *
 * Запуск: node scripts/generate-elements.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = path.join(root, '.build-tmp');
const elementsDir = path.join(root, 'src', 'materials', 'elements');
const modsDir = path.join(root, 'src', 'mods');
fs.mkdirSync(tmp, { recursive: true });
fs.mkdirSync(elementsDir, { recursive: true });
fs.mkdirSync(modsDir, { recursive: true });

// ---------------------------------------------------------------- 1. Дамп
const dumpEntry = path.join(root, 'scripts', 'dump-materials.ts');
const dumpBundle = path.join(tmp, 'dump.mjs');
await build({
  entryPoints: [dumpEntry],
  outfile: dumpBundle,
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'es2022',
  logLevel: 'silent',
});
const jsonPath = path.join(tmp, 'materials.json');
execFileSync(process.execPath, [dumpBundle, jsonPath], { stdio: 'inherit' });
const defs = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const all = Object.keys(defs).map(Number).sort((a, b) => a - b).map(id => defs[String(id)]);
const byKey = new Map(all.map(d => [d.key, d]));
const idOf = key => {
  const d = byKey.get(key);
  if (!d) throw new Error(`Не найден материал ${key}`);
  return d.id;
};

// ---------------------------------------------------------------- 2. Аудит
const GRANULAR_STYLES = new Set(['granular', 'soil', 'crystal', 'coal', 'snow']);
const SHEET_KEYS = new Set([
  'wick', 'paper', 'cardboard', 'cotton_cloth', 'cork', 'plywood', 'linoleum',
  'ceramic_wool', 'fr4', 'kevlar', 'styrofoam', 'silicone', 'drywall',
  'plastic_abs', 'pvc', 'polyethylene', 'acrylic_glass', 'basalt_slab',
]);
const AQUEOUS_KEYS = new Set([
  'water', 'saltwater', 'seawater', 'chicken_broth', 'milk', 'vinegar', 'soy_sauce',
  'beer', 'red_wine', 'coffee_drink', 'condensed_milk', 'orange_juice', 'maple_syrup',
  'liquid_soap', 'alkali',
]);
const SMOTHER_KEYS = new Set([
  ...AQUEOUS_KEYS, 'co2', 'liquid_nitrogen', 'water_mist', 'frost',
]);
const CARBONATE_KEYS = new Set(['marble', 'chalk', 'baking_soda']);
const ABSORB_KEYS = new Set([
  'water', 'saltwater', 'motor_oil', 'crude_oil', 'gasoline', 'ethanol',
  'chicken_broth', 'vegetable_oil', 'milk', 'vinegar', 'soy_sauce', 'beer',
  'red_wine', 'coffee_drink', 'condensed_milk', 'orange_juice', 'maple_syrup',
  'diesel', 'kerosene', 'acetone', 'benzene', 'toluene', 'turpentine',
  'olive_oil', 'castor_oil', 'liquid_soap',
]);
const BLUE_FLAME_KEYS = new Set([
  'ethanol', 'ethanol_vapor', 'methane', 'hydrogen', 'acetone', 'solvent_vapor', 'biogas',
]);
const WHITE_FLAME_KEYS = new Set([
  'magnesium', 'aluminum_filings', 'titanium_filings', 'pyro_mix', 'flash_powder',
]);
const PLASTIC_KEYS = new Set([
  'plastic_abs', 'pvc', 'polyethylene', 'styrofoam', 'linoleum', 'acrylic_glass',
  'molten_plastic', 'silicone',
]);
const PAPER_KEYS = new Set(['paper', 'cardboard', 'cotton_cloth']);
const SLOW_BURN_KEYS = new Set([
  'coal', 'charcoal', 'coal_dust', 'wick', 'wood', 'napalm', 'plywood', 'cork',
  'motor_oil', 'crude_oil', 'vegetable_oil', 'olive_oil', 'castor_oil', 'diesel', 'kerosene',
]);

const ID = {
  water: idOf('water'), co2: idOf('co2'), saltwater: idOf('saltwater'),
  iron: idOf('iron_filings'), titaniumFilings: idOf('titanium_filings'),
  graphiteDust: idOf('graphite_dust'), glassShards: idOf('glass_shards'),
  paperAsh: idOf('paper_ash'), plasticFume: idOf('plastic_fume'),
  steam: idOf('steam'), waterVapor: idOf('water_vapor'),
  bakingSoda: idOf('baking_soda'), vinegar: idOf('vinegar'), acid: idOf('acid'),
  sponge: idOf('sponge'), sawdust: idOf('sawdust'),
};

/** Индивидуальные правки физики по ключу вещества. */
const PHYSICS_FIX = {
  // Тонкие листы: не монолит, рвутся и промокают, но остаются твёрдым телом.
  wick: { porosity: 0.92, tensileStrength: 9, capillary: 165, burnRate: 0.8 },
  paper: { porosity: 0.72, tensileStrength: 18, capillary: 120, burnRate: 5.5 },
  cardboard: { porosity: 0.78, tensileStrength: 24, capillary: 130, burnRate: 5.0 },
  cotton_cloth: { porosity: 0.85, tensileStrength: 14, capillary: 140, burnRate: 6.0 },
  cork: { porosity: 0.8, tensileStrength: 12, burnRate: 1.4 },
  plywood: { tensileStrength: 170, burnRate: 1.4 },
  styrofoam: { porosity: 0.9, tensileStrength: 3, burnRate: 3.0 },
  kevlar: { tensileStrength: 3600, porosity: 0.12 },
  ceramic_wool: { porosity: 0.88, tensileStrength: 6 },
  drywall: { porosity: 0.3, tensileStrength: 42 },
  fr4: { tensileStrength: 310 },
  silicone: { tensileStrength: 45 },
  // Сыпучие с честной текучестью.
  flour: { reposeSkip: 0.25, dispersion: 3 },
  starch: { reposeSkip: 0.25, dispersion: 3 },
  cocoa: { reposeSkip: 0.2, dispersion: 3 },
  baking_soda: { reposeSkip: 0.2, dispersion: 4 },
  silica_gel: { porosity: 0.92, capillary: 130 },
  expanded_clay: { porosity: 0.8, capillary: 110 },
  dry_water: { porosity: 0.35, dispersion: 4 },
  // Жидкости: вязкость и растекание из справочника, без «нулевой дисперсии → 8».
  castor_oil: { viscosity: 0.66, dispersion: 4 },
  condensed_milk: { viscosity: 0.88, dispersion: 3 },
  maple_syrup: { viscosity: 0.82, dispersion: 3 },
  honey: { viscosity: 0.82, dispersion: 4 },
  liquid_soap: { viscosity: 0.45, dispersion: 6 },
  water: { dispersion: 11, viscosity: 0.04 },
  chicken_broth: { dispersion: 10, viscosity: 0.055 },
  // Газы: плотность задаёт плавучесть, дисперсия — скорость растекания.
  sf6: { dispersion: 4 }, radon: { dispersion: 3 }, xenon: { dispersion: 5 },
  // Электрика: источники и нагреватели.
  nichrome_wire: { elecResistanceHeat: 3.2 }, wire_resistor: { elecResistanceHeat: 2.4 },
  superconductor: { elecResistanceHeat: 0 }, led_strip: { emissive: 0.9 },
};

// ---------------------------------------------------------------- 3. Хуки
const HOOKS = {
  dry_water: {
    onStep: `(w, i, x, y, dt) => {
    const motion = w.vx[i] * w.vx[i] + w.vy[i] * w.vy[i];
    if ((w.temp[i] > 45 || w.stress[i] > 4 || motion > 9) && w.rand() < Math.min(1, 3.0 * dt)) {
      w.mat[i] = ${ID.water};
      w.temp[i] = Math.max(0, Math.min(90, w.temp[i]));
      w.vx[i] = 0; w.vy[i] = 0; w.wetness[i] = 0; w.absorbedMat[i] = 0;
    }
  }`,
  },
  baking_soda: { onStep: `(w, i, x, y) => {
    const W = w.width, H = w.height;
    const ns = [i - W, i - 1, i + 1, i + W];
    const ok = [y > 0, x > 0, x + 1 < W, y + 1 < H];
    for (let d = 0; d < 4; d++) {
      if (!ok[d]) continue;
      const j = ns[d], mj = w.mat[j];
      if (mj === ${ID.acid} || mj === ${ID.vinegar}) {
        w.mat[i] = ${ID.co2}; w.wetness[i] = 150;
        w.temp[i] = Math.max(-20, w.temp[i] - 3);
        w.mat[j] = ${ID.saltwater}; w.temp[j] += 4;
        w.airPressure[w.airIdxFromCell(x, y)] += 0.35;
        w.events.sizzleCount++;
        return;
      }
    }
  }` },
  vinegar: { onStep: `(w, i, x, y) => {
    const W = w.width, H = w.height;
    const ns = [i - W, i - 1, i + 1, i + W];
    const ok = [y > 0, x > 0, x + 1 < W, y + 1 < H];
    for (let d = 0; d < 4; d++) {
      if (!ok[d]) continue;
      const j = ns[d], mj = w.mat[j];
      if (mj === ${ID.bakingSoda} || mj === ${ID.acid}) {
        w.mat[i] = ${ID.co2}; w.wetness[i] = 150;
        w.mat[j] = ${ID.saltwater}; w.temp[j] += 4;
        w.airPressure[w.airIdxFromCell(x, y)] += 0.35;
        w.events.sizzleCount++;
        return;
      }
    }
  }` },
  piezo: { onVoltage: `(w, i) => {
    const load = w.stress[i] + Math.abs(w.airPressure[w.airIdxFromCell(i % w.width, (i / w.width) | 0)]) * 0.12;
    return Math.min(24, load * 1.35);
  }` },
  thermocouple: { onVoltage: `(w, i) => {
    const W = w.width, H = w.height, x = i % W, y = (i / W) | 0;
    const l = x > 0 ? w.temp[i - 1] : w.temp[i];
    const r = x + 1 < W ? w.temp[i + 1] : w.temp[i];
    const u = y > 0 ? w.temp[i - W] : w.temp[i];
    const d = y + 1 < H ? w.temp[i + W] : w.temp[i];
    return Math.min(24, (Math.abs(r - l) + Math.abs(d - u)) * 0.09);
  }` },
  tool_magnet: { onBrush: `(w, cx, cy, radius, forEach) => forEach(cx, cy, radius + 8, (x, y, falloff) => {
    const i = y * w.width + x, m = w.mat[i];
    if (m !== ${ID.iron} && m !== ${ID.titaniumFilings} && m !== ${ID.graphiteDust}) return;
    const dx = cx - x, dy = cy - y, len = Math.max(1, Math.sqrt(dx * dx + dy * dy));
    const pull = 2.6 * falloff * Math.min(1, 8 / len);
    w.vx[i] += dx / len * pull; w.vy[i] += dy / len * pull;
  })` },
  tool_vacuum: { onBrush: `(w, cx, cy, radius, forEach) => forEach(cx, cy, radius + 2, (x, y, falloff) => {
    const i = y * w.width + x;
    if (w.stateLut[w.mat[i]] === 4 || w.stateLut[w.mat[i]] === 5) {
      if (w.rand() < 0.35 + 0.6 * falloff) w.mat[i] = 0;
    }
    w.airPressure[w.airIdxFromCell(x, y)] -= 0.6 * falloff;
  })` },
  tool_hammer: { onBrush: `(w, cx, cy, radius, forEach) => forEach(cx, cy, radius, (x, y, falloff) => {
    const i = y * w.width + x, m = w.mat[i];
    if (w.stateLut[m] !== 1) return;
    w.stress[i] += 55 * falloff;
    if (w.stress[i] > w.tensileLut[m] && w.rand() < 0.35 * falloff) {
      w.fractureCell(i, x - cx, y - cy, Math.max(1, Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)), 1.2 * falloff);
      w.stress[i] = 0;
    }
  })` },
  tool_dryer: { onBrush: `(w, cx, cy, radius, forEach) => forEach(cx, cy, radius, (x, y, falloff) => {
    const i = y * w.width + x;
    w.temp[i] = Math.min(320, w.temp[i] + 18 * falloff);
    if (w.wetness[i] > 0) {
      w.wetness[i] = Math.max(0, w.wetness[i] - Math.round(70 * falloff));
      if (w.wetness[i] === 0) w.absorbedMat[i] = 0;
    }
    if (y > 0 && w.mat[i] === ${ID.water} && w.mat[i - w.width] === 0 && w.rand() < 0.04 * falloff) {
      w.setCell(x, y - 1, ${ID.waterVapor}, w.temp[i]);
    }
  })` },
};

// ---------------------------------------------------------------- 4. Модули
const MOD_OF = id => {
  if (id >= 145) return id >= 215 ? 'expansion.energy' : id >= 181 ? 'expansion.fluids' : id >= 167 ? 'expansion.powders' : 'expansion.solids';
  if (id >= 69) return 'phase.reactions';
  return 'core.materials';
};

function fmt(v) {
  return JSON.stringify(v);
}

function reactionsFor(d) {
  const r = [];
  const push = o => r.push({ note: '', ...o });
  if (d.meltInto) push({ trigger: 'heat', minTempC: d.meltTempC, ratePerSecond: 4.8, produce: d.meltInto, note: `Плавление → #${d.meltInto}` });
  if (d.boilInto) push({ trigger: 'heat', minTempC: d.boilTempC, ratePerSecond: d.boilTempC <= 120 ? 0.11 : 8, produce: d.boilInto, note: `Кипение → #${d.boilInto}` });
  if (d.freezeInto) push({ trigger: 'heat', minTempC: d.freezeTempC, produce: d.freezeInto, note: `Затвердевание → #${d.freezeInto}` });
  if (d.flammability > 0 && d.ignitionTempC !== undefined) {
    push({ trigger: 'ignite', minTempC: d.ignitionTempC, ratePerSecond: 21 * d.flammability, produce: idOf('fire'), note: 'Возгорание с образованием пламени' });
  }
  if (d.explosivePower) push({ trigger: 'shock', minTempC: d.ignitionTempC, ratePerSecond: 0, produce: idOf('plasma'), note: `Детонация, мощность ${d.explosivePower}` });
  if (d.waterSoluble) push({ trigger: 'wet', with: [ID.water], ratePerSecond: 2.7, produce: ID.saltwater, note: 'Растворение в воде' });
  if (d.porosity > 0) push({ trigger: 'contact', ratePerSecond: 6, note: 'Капиллярное впитывание жидкости' });
  if (d.elecCond > 0.5) push({ trigger: 'electric', note: 'Проводит электрический ток' });
  return r;
}

function behaviorFor(d, key) {
  const b = {};
  const fix = PHYSICS_FIX[key] || {};
  const cap = fix.capillary ?? (d.porosity > 0 ? Math.round(95 + d.porosity * 60) : 0);
  if (cap > 0) b.capillary = Math.min(255, cap);
  if (SMOTHER_KEYS.has(key)) b.smothers = true;
  if (AQUEOUS_KEYS.has(key)) b.aqueous = true;
  if (ABSORB_KEYS.has(key)) b.absorbable = true;
  if (CARBONATE_KEYS.has(key)) b.carbonate = true;
  if (d.explosivePower >= 0.4 || ['gunpowder', 'tnt', 'nitroglycerin'].includes(key)) b.selfOxidizer = true;
  if (SHEET_KEYS.has(key)) b.sheet = true;
  if (key === 'plastic_fume') b.fume = true;
  if (GRANULAR_STYLES.has(d.textureStyle) || d.state === 'powder') b.granular = true;
  let burnRate = fix.burnRate;
  if (burnRate === undefined) {
    if (SLOW_BURN_KEYS.has(key)) burnRate = 0.5;
    else if (PAPER_KEYS.has(key)) burnRate = 5.5;
    else if (d.flammability > 0) burnRate = 10.5;
  }
  if (burnRate !== undefined) b.burnRatePerSecond = burnRate;
  if (PAPER_KEYS.has(key)) b.burnProduct = ID.paperAsh;
  else if (PLASTIC_KEYS.has(key)) b.burnProduct = ID.plasticFume;
  else if (['wood', 'sugar', 'plywood', 'cork'].includes(key)) b.burnProduct = idOf('charcoal');
  if (BLUE_FLAME_KEYS.has(key)) b.flameColor = 1;
  else if (WHITE_FLAME_KEYS.has(key)) b.flameColor = 2;
  return b;
}

/** Текстура листовых материалов: они не сыпучие и не монолитный камень. */
const SHEET_STYLE = {
  wick: 'fibers', paper: 'fibers', cardboard: 'fibers', cotton_cloth: 'fibers',
  kevlar: 'fibers', ceramic_wool: 'fibers', plywood: 'wood', cork: 'sponge',
  linoleum: 'rubber', silicone: 'rubber', plastic_abs: 'rubber', pvc: 'rubber',
  polyethylene: 'wax', styrofoam: 'sponge', drywall: 'concrete', fr4: 'ceramic',
  acrylic_glass: 'glass', basalt_slab: 'concrete',
};

function applyAudit(d) {
  const fix = PHYSICS_FIX[d.key] || {};
  const out = { ...d, ...fix };
  delete out.capillary; delete out.burnRate;
  // «Воздух» — служебная пустая ячейка, его категория фиксирована.
  if (out.id === 0) { out.state = 'empty'; out.category = 'gases'; out.selectable = false; }

  // ГЛАВНОЕ ИСПРАВЛЕНИЕ: листовые материалы раньше клонировали опилки и
  // поэтому падали песком, хотя лежали во вкладке «Твёрдые». Возвращаем им
  // честное твёрдое состояние и отдельную фактуру листа/волокна.
  if (SHEET_KEYS.has(out.key)) {
    out.state = 'solid';
    out.category = 'solids';
    out.viscosity = 1;
    out.dispersion = 0;
    out.reposeSkip = 1;
    out.textureStyle = SHEET_STYLE[out.key] || 'fibers';
  }

  // Инварианты остальных категорий: в «Твёрдых» только монолиты,
  // в «Сыпучих» только сыпучее, жидкости/газы по состоянию.
  // Служебные состояния («Воздух», энергия, инструменты) не переклассифицируем.
  if (!SHEET_KEYS.has(out.key) && ['solid', 'powder', 'liquid', 'gas'].includes(out.state)) {
    if (out.category === 'solids' && out.state !== 'solid') out.category = out.state === 'powder' ? 'powders' : 'liquids';
    if (out.category === 'powders' && out.state !== 'powder') out.category = 'solids';
    if (out.category === 'liquids' && out.state !== 'liquid') out.category = 'gases';
    if (out.category === 'gases' && out.state !== 'gas') out.category = 'liquids';
  }
  return out;
}

const seenKeys = new Set();
const modules = [];
for (const raw of all) {
  const d = applyAudit(raw);
  let key = d.key;
  if (seenKeys.has(key)) key = `${key}_${d.id}`;
  seenKeys.add(key);
  const mod = MOD_OF(d.id);
  const behavior = behaviorFor(d, raw.key);
  const reactions = reactionsFor(d);
  const hooks = HOOKS[raw.key] || {};
  const tags = [mod, d.state, d.category];
  if (behavior.sheet) tags.push('sheet');
  if (behavior.granular) tags.push('granular');
  if (d.selectable) tags.push('selectable');

  const defLines = Object.entries(d).map(([k, v]) => `    ${k}: ${fmt(v)},`).join('\n');
  const reactionLines = reactions.map(r => `    ${JSON.stringify(r)},`).join('\n');
  const behaviorLines = Object.entries(behavior).map(([k, v]) => `    ${k}: ${fmt(v)},`).join('\n');
  const hookLines = [
    hooks.onStep ? `  onStep: ${hooks.onStep},` : '',
    hooks.onVoltage ? `  onVoltage: ${hooks.onVoltage},` : '',
    hooks.onBrush ? `  onBrush: ${hooks.onBrush},` : '',
  ].filter(Boolean).join('\n');

  const src = `// Элемент #${d.id} — ${d.name}. Файл создан генератором, но редактируется вручную:
// это и есть единственный источник характеристик, реакций и поведения вещества.
import { defineElement } from '../elementApi';

export default defineElement({
  mod: ${fmt(mod)},
  tags: ${fmt(tags)},
  summary: ${fmt(d.shortDesc)},
  def: {
${defLines}
  },
  reactions: [
${reactionLines}
  ],
  behavior: {
${behaviorLines}
  },
${hookLines}
});
`;
  fs.writeFileSync(path.join(elementsDir, `${key}.ts`), src);
  modules.push({ id: d.id, key, mod, selectable: d.selectable, category: d.category, state: d.state });
}

// ---------------------------------------------------------------- 5. Баррель
const barrel = `// Сгенерировано scripts/generate-elements.mjs — ${modules.length} элементов.
// Порядок по id обязателен: RAW_MATERIALS[0] должен быть «Воздух».
import type { ElementModule } from '../elementApi';

${modules.map(m => `import e${m.id} from './${m.key}';`).join('\n')}

export const ELEMENT_MODULES: ElementModule[] = [
${modules.map(m => `  e${m.id},`).join('\n')}
];
`;
fs.writeFileSync(path.join(elementsDir, 'index.ts'), barrel);

// ---------------------------------------------------------------- 6. Моды
fs.writeFileSync(path.join(modsDir, 'types.ts'), `import type { ElementModule } from '../materials/elementApi';

/** Один мод = один файл-манифест со списком своих элементов. */
export interface ModManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  elements: readonly number[];
}
export function defineMod(m: ModManifest): ModManifest { return m; }

/** Контракт стороннего мода: можно поставлять новые элементы отдельным файлом. */
export interface ModBundle {
  manifest: ModManifest;
  elements: readonly ElementModule[];
}
`);

const modGroups = new Map();
for (const m of modules) {
  if (!modGroups.has(m.mod)) modGroups.set(m.mod, []);
  modGroups.get(m.mod).push(m.id);
}
const MOD_META = {
  'core.materials': ['Базовые материалы', 'Стены, сыпучие вещества, жидкости, газы, электрика и инструменты исходного каталога.'],
  'phase.reactions': ['Фазовые переходы и реакции', 'Расплавы, пары, продукты горения, датчики и исполнительные устройства.'],
  'expansion.solids': ['Новые твёрдые тела', 'Полимеры, листовые материалы, композиты, металлы и огнеупоры.'],
  'expansion.powders': ['Новые сыпучие вещества', 'Пищевые порошки, адсорбенты, металлическая стружка и «сухая вода».'],
  'expansion.fluids': ['Новые жидкости и газы', '20 жидкостей и 16 газов с реальными плотностями и температурами кипения.'],
  'expansion.energy': ['Энергия и инструменты', 'Проводники, источники напряжения, 10 взрывчатых веществ и 4 инструмента.'],
};
const modFiles = [];
for (const [id, ids] of modGroups) {
  const safe = id.replace(/\./g, '-');
  const [name, desc] = MOD_META[id] || [id, ''];
  const file = `${safe}.mod.ts`;
  fs.writeFileSync(path.join(modsDir, file), `// Мод ${id}: ${ids.length} элементов. Один файл = один мод.\nimport { defineMod } from './types';\n\nexport default defineMod({\n  id: ${fmt(id)},\n  name: ${fmt(name)},\n  version: '1.0.0',\n  description: ${fmt(desc)},\n  elements: ${fmt(ids)},\n});\n`);
  modFiles.push({ id, file });
}
fs.writeFileSync(path.join(modsDir, 'index.ts'), `import type { ElementModule } from '../materials/elementApi';
import { installElement } from '../materials/elementRegistry';
import type { ModBundle, ModManifest } from './types';
${modFiles.map(m => `import ${m.id.replace(/\./g, '_')} from './${m.file.replace(/\.ts$/, '')}';`).join('\n')}

export const MODS: ModManifest[] = [
${modFiles.map(m => `  ${m.id.replace(/\./g, '_')},`).join('\n')}
];

export function getMod(id: string): ModManifest | undefined {
  return MODS.find(m => m.id === id);
}

/** Установить сторонний мод: каждый его элемент регистрируется отдельно. */
export function installMod(bundle: ModBundle): number[] {
  const ids: number[] = [];
  for (const element of bundle.elements) ids.push(installElement(element));
  return ids;
}
export type { ModBundle, ModManifest } from './types';
`);

// registry.ts и expansion.ts поддерживаются вручную и НЕ перезаписываются
// генератором: в них живут движковые таблицы, а не данные элементов.

console.log(`✓ ${modules.length} element files, ${modFiles.length} mods (registry untouched)`);
console.log('  solids:', modules.filter(m => m.category === 'solids').length,
  'powders:', modules.filter(m => m.category === 'powders').length,
  'liquids:', modules.filter(m => m.category === 'liquids').length,
  'gases:', modules.filter(m => m.category === 'gases').length);
