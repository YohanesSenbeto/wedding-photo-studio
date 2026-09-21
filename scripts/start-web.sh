#!/usr/bin/env bash
# Start the Next.js web application in development mode.
# Requires PostgreSQL (see docker-compose.yml) and .env — see .env.example.
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "[start-web] No .env found — copying .env.example. Edit it (AGENT_TOKEN, DATABASE_URL)."
  cp .env.example .env
fi

echo "[start-web] Applying database migrations (if needed)..."
npx prisma migrate deploy --schema prisma/schema.prisma || {
  echo "[start-web] Migration failed — is PostgreSQL running? Try: docker compose up -d"
  exit 1
}

echo "[start-web] Starting Next.js dev server on http://localhost:3000 ..."
npm run dev -w @wedding/web
