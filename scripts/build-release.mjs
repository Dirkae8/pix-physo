import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { createZipFromDir } from './zip.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const releaseDir = path.join(rootDir, 'release');
const publicDir = path.join(rootDir, 'public');

async function main() {
  // Clean & prepare release folder
  fs.rmSync(releaseDir, { recursive: true, force: true });
  fs.mkdirSync(releaseDir, { recursive: true });

  // Remove previous public artifacts before Vite runs so Vite doesn't copy stale copies
  fs.rmSync(path.join(publicDir, 'PIXPHYSO-Release.zip'), { force: true });
  fs.rmSync(path.join(publicDir, 'PIXPHYSO.html'), { force: true });

  // Build pure self-contained IIFE JS + CSS in memory via Vite/Rollup
  const result = await build({
    root: rootDir,
    configFile: false,
    publicDir: false,
    logLevel: 'info',
    build: {
      write: false,
      target: 'es2020',
      cssCodeSplit: false,
      assetsInlineLimit: 10000000,
      rollupOptions: {
        input: path.join(rootDir, 'src/main.ts'),
        output: {
          format: 'iife',
          name: 'PIXPHYSO_APP',
          inlineDynamicImports: true,
        },
      },
    },
  });

  const outputs = Array.isArray(result) ? result.flatMap((r) => r.output) : result.output;
  let jsCode = '';
  let cssCode = '';

  for (const chunk of outputs) {
    if (chunk.type === 'chunk' && chunk.isEntry) {
      jsCode = chunk.code;
    } else if (chunk.type === 'asset' && chunk.fileName.endsWith('.css')) {
      cssCode += String(chunk.source);
    }
  }

  if (!jsCode) {
    throw new Error('Failed to produce standalone JS bundle');
  }

  const faviconSvg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');
  const faviconUri = `data:image/svg+xml;utf8,${encodeURIComponent(faviconSvg)}`;

  // Escape any accidental </script> sequence safely without String.replace special patterns
  const safeJs = jsCode.split('</script>').join('<\\/script>');

  const standaloneHtml = [
    '<!DOCTYPE html>',
    '<html lang="ru">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
    '  <title>PIXPHYSO — Реалистичная Физическая Песочница (GPU + CPU)</title>',
    `  <link rel="icon" type="image/svg+xml" href="${faviconUri}" />`,
    '  <style>',
    cssCode,
    '  </style>',
    '</head>',
    '<body>',
    '  <div id="app"></div>',
    '  <script>',
    safeJs,
    '  </script>',
    '</body>',
    '</html>',
  ].join('\n');

  const htmlOutPath = path.join(releaseDir, 'PIXPHYSO.html');
  fs.writeFileSync(htmlOutPath, standaloneHtml, 'utf8');

  // Windows 1-click native-window launcher (.bat — pure ASCII so any Windows locale executes cleanly!)
  const winBat = [
    '@echo off',
    'if exist "%~dp0PIXPHYSO.exe" (',
    '  start "" "%~dp0PIXPHYSO.exe"',
    ') else (',
    '  echo PIXPHYSO.exe not found. Please use the full native release archive.',
    '  pause',
    ')',
  ].join('\r\n');
  fs.writeFileSync(path.join(releaseDir, 'START_PIXPHYSO.bat'), winBat, 'utf8');

  // Linux / macOS launcher (.sh)
  const unixSh = [
    '#!/usr/bin/env bash',
    'DIR="$(cd "$(dirname "$0")" && pwd)"',
    'if command -v xdg-open >/dev/null 2>&1; then',
    '  xdg-open "$DIR/PIXPHYSO.html"',
    'elif command -v open >/dev/null 2>&1; then',
    '  open "$DIR/PIXPHYSO.html"',
    'else',
    '  echo "Open $DIR/PIXPHYSO.html in any modern browser."',
    'fi',
  ].join('\n');
  const shPath = path.join(releaseDir, 'START_PIXPHYSO.sh');
  fs.writeFileSync(shPath, unixSh, 'utf8');
  fs.chmodSync(shPath, 0o755);

  // Clear Russian quickstart instructions
  const readmeRu = [
    '============================================================',
    '  PIXPHYSO — Реалистичная Физическая Песочница (GPU + CPU)',
    '============================================================',
    '',
    'КАК ЗАПУСТИТЬ (БЕЗ УСТАНОВКИ, БЕЗ СЕРВЕРА, БЕЗ ИНТЕРНЕТА):',
    '',
    'Вариант 1 (Windows): запустите PIXPHYSO.exe или START_PIXPHYSO.bat',
    '  Требуется установленный Microsoft Edge WebView2 Runtime.',
    '  Игра открывается как отдельное приложение со встроенным WebView2.',
    '',
    'Вариант 2 (Android): установите PIXPHYSO.apk, если он добавлен в архив.',
    '  Android 6+, актуальный системный WebView с поддержкой WebGL2.',
    '',
    'Вариант 3 (Любая ОС — Windows, macOS, Linux, Android):',
    '  Просто дважды откройте файл PIXPHYSO.html в любом современном браузере',
    '  (Chrome, Edge, Яндекс Браузер, Firefox, Brave, Safari).',
    '  Весь движок, шейдеры, материалы и текстуры уже вшиты внутрь одного файла!',
    '',
    'УПРАВЛЕНИЕ:',
    '  • ЛКМ — рисовать выбранным материалом / нажимать Кнопки и Тумблеры на поле',
    '  • ПКМ — ластик (стирать)',
    '  • Колёсико мыши на поле — размер кисти',
    '  • Shift + ЛКМ — ровная прямая стена / провод / труба',
    '  • Пробел — Пауза / Старт',
    '  • F — один шаг физики',
    '  • R — повернуть направление Вентилятора / насоса / диода',
    '  • N — показать только 100 новых предметов (повторно — все)',
    '  • 0–7 — быстрый выбор категории каталога',
    '  • Ctrl + Z — отмена последнего действия',
    '  • Кабель — выберите две точки на проводниках; натяжение задаётся ползунком',
    '  • Миры — локальные сохранения; хранилище очищается вместе с данными приложения',
    '  • Два пальца — масштаб и перемещение; штрих одним пальцем применяется при отпускании',
    '  • Выделить схему — выделить область; в окне Миры задать имя и нажать Схему',
    '  • Диод, насос, клапан и вентилятор: направление выбирается стрелками до размещения',
    '',
  ].join('\r\n');
  fs.writeFileSync(path.join(releaseDir, 'READ_ME_RU.txt'), readmeRu, 'utf8');

  // Create PIXPHYSO-Release.zip in repo root. Собственный ZIP-писатель не
  // требует установленной системной утилиты `zip` (её нет в Windows-окружении).
  const zipPath = path.join(rootDir, 'PIXPHYSO-Release.zip');
  fs.rmSync(zipPath, { force: true });
  const packed = createZipFromDir(releaseDir, zipPath);
  console.log(`✓ Packed ${packed} files into the release archive`);

  // Also place standalone PIXPHYSO.html in root AND both in public/ for 1-click download from Live Preview!
  fs.copyFileSync(htmlOutPath, path.join(rootDir, 'PIXPHYSO.html'));
  fs.copyFileSync(zipPath, path.join(publicDir, 'PIXPHYSO-Release.zip'));
  fs.copyFileSync(htmlOutPath, path.join(publicDir, 'PIXPHYSO.html'));

  const zipStats = fs.statSync(zipPath);
  const htmlStats = fs.statSync(htmlOutPath);
  console.log(
    `\n✓ Standalone PIXPHYSO.html (${(htmlStats.size / 1024).toFixed(1)} KB) and PIXPHYSO-Release.zip (${(zipStats.size / 1024).toFixed(1)} KB) built successfully!`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
