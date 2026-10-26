#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm --prefix frontend ci
VITE_STORAGE_MODE=demo npm --prefix frontend run build
mkdir -p artifacts
tar -czf artifacts/my-journal-demo.tar.gz -C frontend/dist .
printf 'Demo bundle: frontend/dist/ and artifacts/my-journal-demo.tar.gz\n'
