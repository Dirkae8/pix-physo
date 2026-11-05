#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
: "${ZIG_PYTHON:?set ZIG_PYTHON to Python with ziglang}"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
"$ZIG_PYTHON" - "$ROOT/PIXPHYSO.html" "$work/embedded_html.h" <<'PYCODE'
import sys
from pathlib import Path
data = Path(sys.argv[1]).read_bytes()
Path(sys.argv[2]).write_text('static const unsigned char embedded_html[] = {' + ','.join(map(str, data)) + '};\nstatic const unsigned int embedded_html_len = sizeof(embedded_html);\n')
PYCODE
"$ZIG_PYTHON" -m ziglang cc -target x86_64-windows-gnu -Os -municode -Wl,--subsystem,windows -I"$work" "$ROOT/packaging/windows/launcher.c" -lshell32 -o "$ROOT/PIXPHYSO.exe"
