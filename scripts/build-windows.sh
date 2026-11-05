#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
: "${ZIG_PYTHON:?set ZIG_PYTHON to Python with ziglang}"
: "${WEBVIEW2_INCLUDE:?set WEBVIEW2_INCLUDE to a directory containing WebView2.h}"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
"$ZIG_PYTHON" - "$ROOT/PIXPHYSO.html" "$work/embedded_html.h" <<'PYCODE'
import sys
from pathlib import Path
data = Path(sys.argv[1]).read_bytes()
Path(sys.argv[2]).write_text('static const unsigned char embedded_html[] = {' + ','.join(map(str, data)) + '};\nstatic const unsigned int embedded_html_len = sizeof(embedded_html);\n')
PYCODE
# MinGW lacks the Windows SDK EventToken.h. This is its ABI-compatible definition.
printf '#pragma once\n#include <stdint.h>\ntypedef struct EventRegistrationToken { int64_t value; } EventRegistrationToken;\n' > "$work/EventToken.h"
"$ZIG_PYTHON" -m ziglang c++ -target x86_64-windows-gnu -std=c++17 -Os -Wl,--subsystem,windows \
  -I"$work" -I"$WEBVIEW2_INCLUDE" -I"$ROOT/packaging/windows/vendor" \
  "$ROOT/packaging/windows/launcher.cpp" -lole32 -lshell32 -lshlwapi -luser32 -lversion -lgdi32 -o "$ROOT/PIXPHYSO.exe"
