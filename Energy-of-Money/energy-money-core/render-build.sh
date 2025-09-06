#!/usr/bin/env bash
set -euxo pipefail

echo "→ Node version:" && node -v || true
echo "→ NPM version:" && npm -v || true
echo "→ PWD:" && pwd
echo "→ Repo root contents:" && ls -la

echo "\n=== Install client deps ==="
npm --prefix client install --no-audit --no-fund

echo "\n=== Build client ==="
npm --prefix client run build

echo "\n=== Install server deps ==="
npm --prefix server install --no-audit --no-fund

echo "\n✅ Build steps completed"

