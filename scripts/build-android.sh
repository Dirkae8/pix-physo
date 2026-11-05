#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
: "${JAVA_HOME:?set JAVA_HOME to a JRE with keytool}"
: "${APKTOOL_JAR:?set APKTOOL_JAR}"
: "${APKSIGNER_JAR:?set APKSIGNER_JAR}"
: "${PIXPHYSO_KEYSTORE:?set PIXPHYSO_KEYSTORE to a persistent private keystore}"
: "${PIXPHYSO_KEYPASS:?set PIXPHYSO_KEYPASS}"
work="$(mktemp -d)"; trap 'rm -rf "$work"' EXIT
cp -R "$ROOT/packaging/android/." "$work/"
mkdir -p "$work/assets"
cp "$ROOT/PIXPHYSO.html" "$work/assets/index.html"
"$JAVA_HOME/bin/java" -jar "$APKTOOL_JAR" b "$work" -o "$work/unsigned.apk"
"$JAVA_HOME/bin/java" -jar "$APKSIGNER_JAR" sign --v4-signing-enabled false --ks "$PIXPHYSO_KEYSTORE" --ks-pass "env:PIXPHYSO_KEYPASS" --out "$ROOT/PIXPHYSO.apk" "$work/unsigned.apk"
"$JAVA_HOME/bin/java" -jar "$APKSIGNER_JAR" verify --verbose "$ROOT/PIXPHYSO.apk"
