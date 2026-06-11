@echo off
title Sakura_Love Server
cd /d "%~dp0"
echo.
echo ====================================
echo   Sakura_Love Local Server
echo   http://127.0.0.1:8000
echo ====================================
echo.
echo Starting server...
echo.
node server.js --open
echo.
echo Server stopped. Press any key to exit...
pause >nul
