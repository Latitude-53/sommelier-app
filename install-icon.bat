@echo off
chcp 65001 >nul
REM ============================================================
REM  Sommelier app - install icon (double-click to run)
REM ============================================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0install-icon.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Icon install failed
    pause
)
