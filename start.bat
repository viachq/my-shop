@echo off
setlocal enabledelayedexpansion

echo Stopping existing dev processes...
taskkill /F /IM node.exe >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4000 " ^| findstr "LISTENING" 2^>nul') do taskkill /F /PID %%a >nul 2>&1
timeout /t 1 /nobreak >nul

echo Starting PostgreSQL...
sc query postgresql-x64-17 | find "RUNNING" >nul 2>&1
if !errorlevel! == 0 (
    echo PostgreSQL is already running.
) else (
    net start postgresql-x64-17
    if !errorlevel! neq 0 (
        echo Failed to start PostgreSQL. Check Services or run as Administrator.
        pause
        exit /b 1
    )
)
timeout /t 2 /nobreak >nul

start "Client" cmd /k "cd /d C:\Users\viach\Desktop\my-shop\client && npm run dev"
start "Admin"  cmd /k "cd /d C:\Users\viach\Desktop\my-shop\admin  && npm run dev"
start "API"    cmd /k "cd /d C:\Users\viach\Desktop\my-shop\api    && .venv\Scripts\python -m uvicorn app.main:app --reload --port 4000"
