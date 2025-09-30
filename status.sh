#!/usr/bin/env bash
pm2 status
lsof -nP -i :3000 -sTCP:LISTEN || true
lsof -nP -i :4173 -sTCP:LISTEN || true
curl -s 127.0.0.1:3000/health && echo || true
