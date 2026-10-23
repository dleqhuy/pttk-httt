#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
python3 scripts/init_env.py
uv sync --package app
bun install --frozen-lockfile
(cd backend && uv run --package app python -m app.pms.bootstrap --demo)
echo 'PMS đã sẵn sàng. Chạy bash scripts/dev.sh; thông tin đăng nhập nằm trong .env.'
