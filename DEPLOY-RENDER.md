# 🚀 Deploy lên Render.com

## Bước 1: Tạo GitHub Repository

1. Vào https://github.com/
2. Tạo repository mới tên `employee-tracker`
3. Upload tất cả files lên GitHub

## Bước 2: Deploy lên Render

1. Vào https://render.com/
2. Đăng ký bằng GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repository
5. Cấu hình:
   - **Name**: `employee-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Click "Create Web Service"

## Bước 3: Lấy URL

1. Sau khi deploy xong, Render sẽ cho URL
2. Copy URL (ví dụ: `https://employee-tracker.onrender.com`)
3. Cập nhật `config.js`:

```javascript
const SERVER_URL = 'https://employee-tracker.onrender.com';
```

## Ưu điểm Render:

✅ **Miễn phí hoàn toàn**  
✅ **Tự động chạy 24/7**  
✅ **Setup đơn giản**  
✅ **URL cố định**  
✅ **Auto restart**  

## Lưu ý:

- Render có thể sleep sau 15 phút không có traffic
- Lần đầu access sẽ mất 30 giây để wake up
- Data sẽ được lưu trong Render's storage 