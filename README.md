# 📊 Employee Activity Tracker

Extension Chrome để theo dõi hoạt động nhân viên trên Facebook, bao gồm thời gian làm việc và các comment được đăng.

## ✨ Tính năng

- **Theo dõi thời gian**: Ghi nhận thời điểm bắt đầu làm việc
- **Tracking comment**: Tự động ghi nhận các comment Facebook
- **Giao diện đẹp**: UI hiện đại với gradient và animations
- **Dashboard admin**: Trang quản lý dữ liệu với thống kê chi tiết
- **Timer real-time**: Hiển thị thời gian tracking trực tiếp
- **Export dữ liệu**: Xuất dữ liệu ra file JSON
- **Lưu trữ bền vững**: Dữ liệu được lưu vào file và tự động backup

## 🚀 Cài đặt

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Khởi động server
```bash
node server.js
```

Server sẽ chạy tại: `http://localhost:3000`

### 3. Cài đặt Extension

1. Mở Chrome và vào `chrome://extensions/`
2. Bật "Developer mode"
3. Click "Load unpacked" và chọn thư mục chứa extension
4. Extension sẽ xuất hiện trên thanh công cụ

## 📖 Hướng dẫn sử dụng

### Cho nhân viên:

1. **Bắt đầu tracking**:
   - Click vào icon extension
   - Nhập mã nhân viên
   - Click "Bắt đầu"
   - Extension sẽ hiển thị badge "ON" khi đang tracking

2. **Dừng tracking**:
   - Click vào icon extension
   - Click "Dừng"
   - Extension sẽ tắt tracking

3. **Tracking comment**:
   - Khi đang tracking, mọi comment Facebook sẽ tự động được ghi nhận
   - Không cần thao tác thêm

### Cho admin:

1. **Xem dashboard**: Truy cập `http://localhost:3000/admin.html`
2. **Thống kê**: Xem tổng quan hoạt động và comment
3. **Quản lý dữ liệu**: Xóa hoặc xuất dữ liệu
4. **Theo dõi nhân viên**: Xem thống kê từng nhân viên

## 🔧 API Endpoints

### Server API:

- `POST /activity` - Ghi nhận hoạt động mới
- `POST /comment` - Ghi nhận comment mới
- `GET /data` - Lấy dữ liệu (có thể filter)
- `GET /employees` - Thống kê nhân viên
- `DELETE /data` - Xóa dữ liệu
- `GET /health` - Kiểm tra trạng thái server

### Extension API:

- `chrome.runtime.sendMessage({ action: 'startTracking', employeeId })`
- `chrome.runtime.sendMessage({ action: 'stopTracking' })`
- `chrome.runtime.sendMessage({ action: 'getStatus' })`

## 📁 Cấu trúc file

```
tool/
├── manifest.json          # Cấu hình extension
├── popup.html            # Giao diện popup
├── popup.js              # Logic popup
├── content_script.js     # Script chạy trên Facebook
├── background.js         # Background service worker
├── server.js             # Server Node.js
├── admin.html            # Dashboard admin
├── package.json          # Dependencies
└── README.md            # Hướng dẫn này
```

## 🎨 Tính năng UI/UX

- **Gradient background**: Thiết kế hiện đại với gradient
- **Smooth animations**: Hiệu ứng mượt mà khi hover/click
- **Responsive design**: Tương thích mobile
- **Real-time timer**: Hiển thị thời gian tracking
- **Status indicators**: Badge và màu sắc trạng thái
- **Error handling**: Thông báo lỗi rõ ràng

## 🔒 Bảo mật

- **Validation**: Kiểm tra dữ liệu đầu vào
- **Error handling**: Xử lý lỗi an toàn
- **Data persistence**: Lưu trữ dữ liệu bền vững
- **Graceful shutdown**: Tắt server an toàn

## 🐛 Troubleshooting

### Extension không hoạt động:
1. Kiểm tra console trong DevTools
2. Đảm bảo server đang chạy
3. Kiểm tra permissions trong manifest.json

### Server lỗi:
1. Kiểm tra port 3000 có đang được sử dụng không
2. Đảm bảo đã cài đặt dependencies
3. Kiểm tra file data.json có quyền ghi

### Tracking không hoạt động:
1. Đảm bảo đã bật tracking trong popup
2. Kiểm tra employee ID đã được nhập
3. Refresh trang Facebook nếu cần

## 📈 Tính năng nâng cao

- **Filter dữ liệu**: Theo nhân viên, ngày tháng
- **Export dữ liệu**: Xuất ra JSON
- **Auto refresh**: Tự động cập nhật dashboard
- **Multiple selectors**: Hỗ trợ nhiều loại nút gửi Facebook
- **Data backup**: Tự động lưu vào file

## 🤝 Đóng góp

Nếu bạn muốn đóng góp vào dự án:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

Dự án này được phát hành dưới MIT License.

---

**Lưu ý**: Extension này chỉ nên được sử dụng với sự đồng ý của nhân viên và tuân thủ các quy định về quyền riêng tư. 