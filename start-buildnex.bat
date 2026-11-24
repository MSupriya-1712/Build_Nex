@echo off
cd /d "%~dp0"
title BuildNex Launcher
echo ========================================================
echo  BuildNex - Smart Real-Time Construction Platform
echo ========================================================
echo.

SET "PATH=C:\Program Files\nodejs;C:\Users\Supriya Naidu\.gemini\antigravity\scratch\nodejs;%PATH%"

echo [1/3] Starting Express Real-Time Backend on port 5000...
start "BuildNex Backend (Port 5000)" cmd /k "cd /d ""%~dp0backend"" && npm start"

echo [2/3] Starting Vite Frontend on port 5173...
start "BuildNex Frontend (Port 5173)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo [3/3] Opening browser at http://localhost:5173 ...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================================
echo  BuildNex is LIVE and Running in Real-Time!
echo  - Frontend:    http://localhost:5173
echo  - Backend API: http://localhost:5000/api
echo  - Real-Time:   http://localhost:5000/api/events (SSE)
echo ========================================================
echo Keep the backend and frontend console windows open.
pause
