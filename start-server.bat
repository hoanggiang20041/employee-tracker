@echo off
echo ========================================
echo    Employee Tracker Server
echo ========================================
echo.
echo Dang khoi dong server...
echo.

cd /d "%~dp0"

REM Kiem tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js chua duoc cai dat!
    echo Vui long cai dat Node.js tu: https://nodejs.org/
    pause
    exit /b 1
)

REM Kiem tra dependencies
if not exist "node_modules" (
    echo Dang cai dat dependencies...
    npm install
)

REM Khoi dong server
echo.
echo Server se chay tai: http://localhost:3000
echo Admin Dashboard: http://localhost:3000/admin.html
echo Test Page: http://localhost:3000/test-facebook.html
echo.
echo Nhan Ctrl+C de dung server
echo ========================================
echo.

node server.js

pause 