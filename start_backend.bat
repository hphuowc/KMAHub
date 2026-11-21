@echo off
chcp 65001 >nul
title KMA Hub - Backend Server
echo ==============================================================================
echo   Dang khoi dong KMA Hub Backend Server (FastAPI + MySQL)...
echo ==============================================================================
if exist "%~dp0backend" (
    cd /d "%~dp0backend"
) else (
    cd /d "%~dp0..\backend"
)
"C:\HCTP~1\5.2\python\bin\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause
