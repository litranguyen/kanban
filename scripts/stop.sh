#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")/.."
docker compose down
printf 'Backend stopped\n'
