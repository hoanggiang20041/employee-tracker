@echo off
echo ========================================
echo    Deploy Employee Tracker voi Ngrok
echo ========================================
echo.

echo Buoc 1: Tai ngrok
echo Vao: https://ngrok.com/download
echo Tai ngrok.exe va copy vao thu muc nay
echo.

echo Buoc 2: Dang ky ngrok (mien phi)
echo Vao: https://ngrok.com/signup
echo Tao tai khoan va copy authtoken
echo.

echo Buoc 3: Setup ngrok
echo Chay: ngrok config add-authtoken YOUR_TOKEN
echo.

echo Buoc 4: Khoi dong server
echo Chay: node server.js
echo.

echo Buoc 5: Expose port (mo terminal moi)
echo Chay: ngrok http 3000
echo.

echo Buoc 6: Copy URL va cap nhat config.js
echo Thay doi SERVER_URL thanh URL ngrok
echo.

echo ========================================
echo Huong dan chi tiet:
echo 1. Tai ngrok.exe
echo 2. Dang ky tai khoan ngrok
echo 3. Chay: ngrok config add-authtoken YOUR_TOKEN
echo 4. Chay: node server.js
echo 5. Chay: ngrok http 3000
echo 6. Copy URL va cap nhat config.js
echo ========================================
echo.

pause 