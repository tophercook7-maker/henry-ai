#!/usr/bin/env bash
set -euo pipefail
pm2 delete henry-web >/dev/null 2>&1 || true
pm2 delete henry-api >/dev/null 2>&1 || true
echo "All PM2 apps stopped."
