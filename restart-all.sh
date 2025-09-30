#!/usr/bin/env bash
set -e
pm2 restart henry-api || true
pm2 restart henry-web || true
pm2 save
~/henry/status.sh
