#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build:release
"$ROOT/scripts/build-windows.sh"
"$ROOT/scripts/build-android.sh"
zip -j -9 "$ROOT/PIXPHYSO-Release.zip" "$ROOT/PIXPHYSO.exe" "$ROOT/PIXPHYSO.apk" "$ROOT/UPDATE-NOTES.md"
cp "$ROOT/PIXPHYSO-Release.zip" "$ROOT/public/PIXPHYSO-Release.zip"
