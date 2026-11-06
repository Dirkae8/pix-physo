/* Вспомогательный модуль для generate-elements.mjs: собирает уже разрешённый
 * каталог (со всеми клонами, расплавами и скрытыми состояниями) в JSON. */
import fs from 'node:fs';
import { MATERIAL_BY_ID, MAX_MAT_ID } from '../src/materials/registry';

const out: Record<string, unknown> = {};
for (let id = 0; id < MAX_MAT_ID; id++) {
  const def = MATERIAL_BY_ID[id];
  if (!def || def.id !== id) continue;
  out[String(id)] = def;
}
fs.writeFileSync(process.argv[2] ?? '.build-tmp/materials.json', JSON.stringify(out, null, 2));
console.log(`Dumped ${Object.keys(out).length} resolved materials`);
