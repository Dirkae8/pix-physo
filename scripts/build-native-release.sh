#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run build:release
"$ROOT/scripts/build-windows.sh"
"$ROOT/scripts/build-android.sh"
node "$ROOT/scripts/pack-native-release.mjs"
