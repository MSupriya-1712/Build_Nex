@echo off
cd /d "%~dp0"
echo ========================================================
echo Starting BuildNex Smart Construction Management Platform
echo ========================================================
echo.

SET "PATH=C:\Program Files\nodejs;C:\Users\Supriya Naidu\.gemini\antigravity\scratch\nodejs;%PATH%"

echo [1/2] Starting Express REST API on http://localhost:5000 ...
start "BuildNex Backend" cmd /k "cd /d ""%~dp0backend"" && npm start"

echo [2/2] Starting Vite Frontend on http://localhost:5173 ...
start "BuildNex Frontend" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo ========================================================
echo BuildNex is launching!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:5000/api
echo ========================================================
