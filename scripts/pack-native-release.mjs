import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createZipFromDir } from './zip.mjs';

/**
 * Собирает общий архив после того, как HTML и нативные пакеты уже собраны:
 * PIXPHYSO.html + PIXPHYSO.exe + PIXPHYSO.apk + скрипты запуска + заметки.
 * Не требует системной утилиты `zip`.
 */
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseDir = path.join(rootDir, 'release');
if (!fs.existsSync(releaseDir)) fs.mkdirSync(releaseDir, { recursive: true });

for (const file of ['PIXPHYSO.html', 'PIXPHYSO.exe', 'PIXPHYSO.apk', 'UPDATE-NOTES.md']) {
  const src = path.join(rootDir, file);
  if (!fs.existsSync(src)) {
    console.warn(`⚠ Пропущен ${file} — файл не собран`);
    continue;
  }
  fs.copyFileSync(src, path.join(releaseDir, file));
}

const zipPath = path.join(rootDir, 'PIXPHYSO-Release.zip');
const count = createZipFromDir(releaseDir, zipPath);
fs.copyFileSync(zipPath, path.join(rootDir, 'public', 'PIXPHYSO-Release.zip'));
console.log(`✓ PIXPHYSO-Release.zip: ${count} файлов, ${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB`);
