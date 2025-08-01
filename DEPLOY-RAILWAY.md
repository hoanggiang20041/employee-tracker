# 🚀 Deploy lên Railway

## Bước 1: Tạo GitHub Repository

1. Vào https://github.com/
2. Tạo repository mới tên `employee-tracker`
3. Upload tất cả files lên GitHub

## Bước 2: Deploy lên Railway

1. Vào https://railway.app/
2. Đăng ký bằng GitHub
3. Click "New Project"
4. Chọn "Deploy from GitHub repo"
5. Chọn repository `employee-tracker`
6. Railway sẽ tự động deploy

## Bước 3: Lấy URL

1. Sau khi deploy xong, Railway sẽ cho URL
2. Copy URL (ví dụ: `https://employee-tracker-production.up.railway.app`)
3. Cập nhật `config.js`:

```javascript
const SERVER_URL = 'https://employee-tracker-production.up.railway.app';
```

## Bước 4: Test

1. Mở URL + `/health` để test
2. Mở URL + `/admin.html` để vào admin dashboard
3. Cài đặt extension và test

## Ưu điểm Railway:

✅ **Miễn phí** - 500 giờ/tháng  
✅ **Tự động chạy 24/7**  
✅ **Không cần bật máy**  
✅ **URL cố định**  
✅ **Auto restart khi lỗi**  

## Lưu ý:

- Railway sẽ tự động restart server nếu có lỗi
- Data sẽ được lưu trong Railway's storage
- Có thể monitor logs trong Railway dashboard 