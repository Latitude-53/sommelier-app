@echo off
chcp 65001 >nul
REM ============================================================
REM  Sommelier app - setup JDK (downloads Temurin JDK 17)
REM  Run this ONCE if build-apk.bat fails with "JDK not found"
REM ============================================================

cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0setup-jdk.ps1"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] JDK setup failed
    pause
)
