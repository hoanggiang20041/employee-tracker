#!/bin/bash

echo "========================================"
echo "    Employee Tracker Server"
echo "========================================"
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js chưa được cài đặt!"
    echo "Vui lòng cài đặt Node.js từ: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Kiểm tra dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Đang cài đặt dependencies..."
    npm install
fi

# Kiểm tra port 3000 có đang được sử dụng không
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Port 3000 đang được sử dụng!"
    echo "Đang dừng process cũ..."
    lsof -ti:3000 | xargs kill -9
    sleep 2
fi

# Khởi động server
echo ""
echo "🚀 Đang khởi động server..."
echo ""
echo "📊 Server sẽ chạy tại:"
echo "   http://localhost:3000"
echo ""
echo "🔧 Admin Dashboard:"
echo "   http://localhost:3000/admin.html"
echo ""
echo "🧪 Test Page:"
echo "   http://localhost:3000/test-facebook.html"
echo ""
echo "💡 Nhấn Ctrl+C để dừng server"
echo "========================================"
echo ""

# Khởi động server
node server.js 