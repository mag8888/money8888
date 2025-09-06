#!/usr/bin/env bash
set -euxo pipefail

echo "→ Node version:" && node -v || true
echo "→ NPM version:" && npm -v || true
echo "→ PWD:" && pwd
echo "→ Server dir contents:" && ls -la

echo "\n=== Install client deps (../client) ==="
npm --prefix ../client install --no-audit --no-fund

echo "\n=== Build client (../client) ==="
npm --prefix ../client run build

echo "\n=== Install server deps (.) ==="
npm install --no-audit --no-fund

echo "\n✅ Build steps completed from server directory"

