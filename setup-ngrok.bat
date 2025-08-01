@echo off
echo ========================================
echo    Setup Ngrok cho Employee Tracker
echo ========================================
echo.

echo Buoc 1: Cai dat ngrok
echo Tai ngrok tu: https://ngrok.com/download
echo Giai nen va copy ngrok.exe vao thu muc nay
echo.

echo Buoc 2: Dang ky tai khoan ngrok
echo 1. Vao https://ngrok.com/signup
echo 2. Tao tai khoan mien phi
echo 3. Copy authtoken
echo.

echo Buoc 3: Chay lenh sau:
echo ngrok config add-authtoken YOUR_TOKEN_HERE
echo.

echo Buoc 4: Khoi dong server
echo node server.js
echo.

echo Buoc 5: Mo terminal moi va chay:
echo ngrok http 3000
echo.

echo Buoc 6: Copy URL ngrok va cap nhat config.js
echo SERVER_URL: 'https://abc123.ngrok.io'
echo.

echo ========================================
echo Huong dan chi tiet:
echo 1. Tai ngrok.exe va copy vao thu muc
echo 2. Chay: ngrok config add-authtoken YOUR_TOKEN
echo 3. Chay: node server.js
echo 4. Chay: ngrok http 3000
echo 5. Copy URL va cap nhat config.js
echo ========================================
echo.

pause 