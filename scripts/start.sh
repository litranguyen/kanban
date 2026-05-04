#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
docker compose up --build -d
printf 'Backend started at http://localhost:8000\n'
