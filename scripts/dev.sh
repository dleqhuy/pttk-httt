#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f .env ]; then
  echo 'Tạo .env từ .env.example và thay SECRET_KEY / mật khẩu trước khi chạy.'
  exit 1
fi
(cd backend && uv run --package app python -m app.pms.bootstrap --demo)
(cd backend && uv run --package app fastapi dev --host 127.0.0.1) &
backend_pid=$!
trap 'kill "$backend_pid" 2>/dev/null || true' EXIT INT TERM
bun run dev
