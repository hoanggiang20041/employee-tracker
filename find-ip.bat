@echo off
echo ========================================
echo    Tim IP may cua ban
echo ========================================
echo.

echo Danh sach IP cua may ban:
echo.

ipconfig | findstr "IPv4"

echo.
echo ========================================
echo Huong dan:
echo 1. Copy IP o tren (VD: 192.168.1.100)
echo 2. Mo file config.js
echo 3. Thay doi SERVER_URL thanh IP cua ban
echo 4. Luu file va reload extension
echo ========================================
echo.

pause 