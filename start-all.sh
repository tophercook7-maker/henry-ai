#!/usr/bin/env bash
set -euo pipefail
pkill -f "vite" 2>/dev/null || true
cd ~/henry/apps/api
pm2 delete henry-api >/dev/null 2>&1 || true
pm2 start node --name henry-api -- server.js --watch
cd ~/henry/apps/web
npm run build
pm2 delete henry-web >/dev/null 2>&1 || true
pm2 start npm --name henry-web -- run preview -- --host
pm2 save
echo "API  : http://192.168.1.220:3000"
echo "WEB  : http://192.168.1.220:4173"
