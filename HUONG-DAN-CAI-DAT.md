# 📋 Hướng dẫn cài đặt Employee Tracker

## 🚀 Cách 1: Sử dụng script tự động (Khuyến nghị)

### Windows:
1. **Double-click** vào file `start-server.bat` hoặc `start-server.ps1`
2. Đợi server khởi động
3. Mở browser và truy cập: `http://localhost:3000/admin.html`

### Mac/Linux:
```bash
chmod +x start-server.sh
./start-server.sh
```

## 🔧 Cách 2: Cài đặt thủ công

### Bước 1: Cài đặt Node.js
1. Tải Node.js từ: https://nodejs.org/
2. Cài đặt với tất cả tùy chọn mặc định
3. Kiểm tra: Mở Command Prompt/PowerShell và gõ:
   ```bash
   node --version
   npm --version
   ```

### Bước 2: Cài đặt dependencies
1. Mở Command Prompt/PowerShell
2. Di chuyển đến thư mục dự án:
   ```bash
   cd C:\Users\giang\Desktop\tool
   ```
3. Cài đặt dependencies:
   ```bash
   npm install
   ```

### Bước 3: Khởi động server
```bash
node server.js
```

## ✅ Kiểm tra cài đặt

### 1. Kiểm tra server
- Mở browser và truy cập: `http://localhost:3000`
- Nếu thấy thông báo "Server is running" là thành công

### 2. Kiểm tra Admin Dashboard
- Truy cập: `http://localhost:3000/admin.html`
- Nếu thấy giao diện admin là thành công

### 3. Kiểm tra Test Page
- Truy cập: `http://localhost:3000/test-facebook.html`
- Nếu thấy trang test là thành công

## 🔧 Cài đặt Extension

### Bước 1: Mở Chrome Extensions
1. Mở Chrome browser
2. Gõ vào address bar: `chrome://extensions/`
3. Bật "Developer mode" (góc phải trên)

### Bước 2: Load Extension
1. Click "Load unpacked"
2. Chọn thư mục: `C:\Users\giang\Desktop\tool`
3. Extension sẽ xuất hiện trên thanh công cụ

### Bước 3: Test Extension
1. Click vào icon extension
2. Nhập thông tin nhân viên
3. Click "Bắt đầu"

## 🐛 Troubleshooting

### Lỗi "Port 3000 đang được sử dụng"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3000
kill -9 <PID>
```

### Lỗi "Node.js not found"
- Cài đặt lại Node.js từ https://nodejs.org/
- Restart Command Prompt/PowerShell

### Lỗi "npm install failed"
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

### Lỗi "Extension không hoạt động"
1. Kiểm tra server có đang chạy không
2. Mở DevTools (F12) và xem Console
3. Reload extension trong `chrome://extensions/`

## 📊 Các URL quan trọng

- **Server Health Check**: `http://localhost:3000/health`
- **Admin Dashboard**: `http://localhost:3000/admin.html`
- **Test Page**: `http://localhost:3000/test-facebook.html`
- **Connection Test**: `http://localhost:3000/test-connection.html`

## 🔒 Bảo mật

- Server chỉ chạy trên localhost (127.0.0.1)
- Không expose ra internet
- Dữ liệu được lưu trong file `data.json`

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console trong DevTools
2. Kiểm tra server logs
3. Restart server và extension
4. Xóa và cài lại extension

---

**Lưu ý**: Đảm bảo server luôn chạy khi sử dụng extension! 

##  **Hướng dẫn chi tiết:**

### **Option A: Deploy lên Vercel (Dễ nhất)**

1. **Cài đặt Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Cập nhật config.js:**
   ```javascript
   SERVER_URL: 'https://your-app.vercel.app'
   ```

### **Option B: Sử dụng ngrok (Nhanh nhất)**

1. **Tải ngrok:** https://ngrok.com/download
2. **Đăng ký tài khoản:** https://ngrok.com/signup
3. **Setup:**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```
4. **Chạy server:**
   ```bash
   node server.js
   ```
5. **Expose port:**
   ```bash
   ngrok http 3000
   ```
6. **Copy URL và cập nhật config.js**

### **Option C: Deploy lên Railway**

1. **Tạo tài khoản:** https://railway.app/
2. **Connect GitHub repository**
3. **Deploy tự động**
4. **Copy URL và cập nhật config.js**

##  **Khuyến nghị:**

**Sử dụng ngrok** vì:
- ✅ Miễn phí
- ✅ Setup nhanh (5 phút)
- ✅ Không cần deploy
- ✅ URL thay đổi mỗi lần restart

Bạn muốn thử cách nào? Tôi sẽ hướng dẫn chi tiết! 