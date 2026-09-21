#!/usr/bin/env bash
# ============================================================
# Start the local Photoshop agent (README §24/§25).
#
# - On Windows (Git Bash / PowerShell-called bash): runs the agent directly.
# - Under WSL: forwards to Windows PowerShell so the agent can talk to
#   Photoshop via COM. WSL itself can NEVER control Photoshop.
# - Without Windows/Photoshop: falls back to DRY RUN (clearly labelled
#   simulation — NOT Photoshop) so the pipeline can still be exercised.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

if uname -s | grep -qi microsoft; then
  echo "[start-agent] WSL detected — forwarding to Windows PowerShell..."
  WSL_REL_WINDOWS_PATH="$(wslpath -w "$(pwd)/apps/photoshop-agent")"
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$WSL_REL_WINDOWS_PATH\\start-agent.ps1" "$@"
  exit $?
fi

if [[ "${OS:-}" == "Windows_NT" ]] || uname -s | grep -qi mingw; then
  echo "[start-agent] Starting Photoshop agent (COM mode)..."
  (cd apps/photoshop-agent && npx tsx src/index.ts "$@")
else
  echo "[start-agent] Non-Windows machine: starting agent in DRY RUN mode."
  echo "[start-agent] DRY RUN is NOT Photoshop — it only exercises the job pipeline."
  AGENT_PHOTOSHOP_MODE=DRYRUN npx tsx apps/photoshop-agent/src/index.ts "$@"
fi
