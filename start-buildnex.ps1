Set-Location -Path $PSScriptRoot

# Set path to node environment
$env:PATH = "C:\Program Files\nodejs;C:\Users\Supriya Naidu\.gemini\antigravity\scratch\nodejs;" + $env:PATH

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  BuildNex - Smart Construction Management Platform" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend API Server on http://localhost:5000/api..." -ForegroundColor Yellow
$backend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$PSScriptRoot\backend`" && npm start" -PassThru

Write-Host "Starting Frontend Vite Server on http://localhost:5173..." -ForegroundColor Green
$frontend = Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$PSScriptRoot\frontend`" && npm run dev" -PassThru

Write-Host ""
Write-Host "Both servers launched successfully!" -ForegroundColor Green
Write-Host "Frontend URL: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:  http://localhost:5000/api" -ForegroundColor White
Write-Host "Press Ctrl+C or close windows to terminate." -ForegroundColor Gray
