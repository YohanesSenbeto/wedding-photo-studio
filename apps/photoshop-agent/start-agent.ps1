# ============================================================
# Wedding Photo Studio — start the LOCAL PHOTOSHOP AGENT (Windows)
# Run from:  apps\photoshop-agent\  via  .\start-agent.ps1
# Requires:  Node.js 20+, Adobe Photoshop 2022, winax (npm install)
# ============================================================

$ErrorActionPreference = "Stop"

# Move to the agent directory (two levels up from repo root)
$agentDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $agentDir

Write-Host "=== Wedding Photo Studio — Photoshop Agent ===" -ForegroundColor Yellow

# .env
if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example — EDIT IT (SERVER_URL, AGENT_TOKEN, PHOTOSHOP_PATH)." -ForegroundColor Red
    notepad ".env"
}

# Dependencies (winax is required for COM on Windows)
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies (winax COM bridge included)..."
    npm install
}

# Sanity: Photoshop present?
$psPath = "C:\Program Files\Adobe\Adobe Photoshop 2022\Photoshop.exe"
if ($env:PHOTOSHOP_PATH) { $psPath = $env:PHOTOSHOP_PATH }
if (-not (Test-Path $psPath)) {
    Write-Host "WARNING: Photoshop not found at $psPath" -ForegroundColor Yellow
    Write-Host "Set PHOTOSHOP_PATH in .env, or the agent will report PS_NOT_INSTALLED for jobs."
}

Write-Host "Starting agent (Ctrl+C to stop)..." -ForegroundColor Green
npx tsx src/index.ts @args
