# Employee Tracker Server Startup Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Employee Tracker Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js chưa được cài đặt!" -ForegroundColor Red
    Write-Host "Vui lòng cài đặt Node.js từ: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

# Kiểm tra dependencies
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Đang cài đặt dependencies..." -ForegroundColor Yellow
    npm install
}

# Kiểm tra port 3000 có đang được sử dụng không
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "⚠️ Port 3000 đang được sử dụng!" -ForegroundColor Yellow
    Write-Host "Đang dừng process cũ..." -ForegroundColor Yellow
    Stop-Process -Id $portInUse.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Khởi động server
Write-Host ""
Write-Host "🚀 Đang khởi động server..." -ForegroundColor Green
Write-Host ""
Write-Host "📊 Server sẽ chạy tại:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Admin Dashboard:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/admin.html" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test Page:" -ForegroundColor Cyan
Write-Host "   http://localhost:3000/test-facebook.html" -ForegroundColor White
Write-Host ""
Write-Host "💡 Nhấn Ctrl+C để dừng server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Khởi động server
node server.js 