@echo off
REM ============================================================
REM Wedding Photo Studio - start the LOCAL PHOTOSHOP AGENT (Windows)
REM ============================================================
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-agent.ps1" %*
