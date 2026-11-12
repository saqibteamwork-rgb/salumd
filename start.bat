@echo off
title SALU MD - WhatsApp Bot
cd /d "%~dp0"
echo =======================================================
echo           SALU MD - WHATSAPP BOT LAUNCHER
echo =======================================================
echo.
echo [1] Checking Node.js installation...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2] Starting Bot Server...
echo.
echo Open your browser at: http://localhost:20168
echo.
node index.js
pause
