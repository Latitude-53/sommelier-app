@echo off
chcp 65001 >nul
REM ============================================================
REM  Sommelier app - build APK (double-click to run)
REM ============================================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0build-apk.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Build failed with code %ERRORLEVEL%
    pause
)
