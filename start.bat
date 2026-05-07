@echo off
echo Starting PostgreSQL...
"C:\Program Files\PostgreSQL\17\bin\pg_ctl" stop -D "C:\Program Files\PostgreSQL\17\data" -m fast 2>nul
"C:\Program Files\PostgreSQL\17\bin\pg_ctl" start -D "C:\Program Files\PostgreSQL\17\data" -l "C:\Program Files\PostgreSQL\17\data\log\startup.log" 2>nul
timeout /t 3 /nobreak >nul

start "Client" cmd /k "cd /d C:\Users\viach\Desktop\my-shop\client && npm run dev"
start "Admin"  cmd /k "cd /d C:\Users\viach\Desktop\my-shop\admin  && npm run dev"
start "API"    cmd /k "cd /d C:\Users\viach\Desktop\my-shop\api    && .venv\Scripts\python -m uvicorn app.main:app --reload --port 4000"
