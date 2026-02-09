@echo off
color 0A
echo.
echo ========================================
echo   Mobile Shop ERP - Starting System
echo ========================================
echo.

echo [1/2] Starting Backend Server...
start "ERP Backend Server" cmd /k "cd /d F:\erp\backend && npm run dev"

echo [2/2] Starting Frontend Server...
timeout /t 5 /nobreak > nul
start "ERP Frontend Server" cmd /k "cd /d F:\erp\frontend && npm run dev"

timeout /t 3 /nobreak > nul

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo ========================================
echo.
echo Your browser will open automatically...
echo.

timeout /t 5 /nobreak > nul
start http://localhost:5173

echo Press any key to close this window...
echo (The servers will continue running)
pause > nul
