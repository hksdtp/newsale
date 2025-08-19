# 🐳 Hướng dẫn Docker Setup

## ✅ Khởi động thành công!

Web app đã được khởi động thành công với Docker tại:
- **URL**: http://localhost:3000
- **Container**: newsale-app-dev-1
- **Status**: Running

## 🔧 Quản lý Docker Container

### Các lệnh cơ bản:

```bash
# Xem trạng thái containers
docker-compose ps

# Xem logs realtime
docker-compose logs -f app-dev

# Dừng ứng dụng
docker-compose down

# Khởi động lại
docker-compose restart app-dev

# Build lại và khởi động
docker-compose --profile dev up --build -d app-dev
```

### Sử dụng script tự động:

```bash
# Chạy script tương tác
./docker-start.sh

# Các tùy chọn:
# 1) Development (port 3000)
# 2) Production (port 80) 
# 3) Development + Supabase
# 4) Dừng tất cả containers
# 5) Xem logs
```

## ✅ Lỗi đã được khắc phục

### 🔧 **Lỗi ModernTaskFilters**
- ✅ Đã sửa import thiếu component `ModernTaskFilters` trong `TaskList.tsx`
- ✅ Component hiện hoạt động bình thường

### 🔧 **Lỗi Supabase API calls**
- ✅ Tạo `mockDataService.ts` với dữ liệu giả lập
- ✅ Cập nhật `autoMoveService.ts` để sử dụng mock data
- ✅ Cập nhật `dashboardStatsService.ts` để sử dụng mock data
- ✅ Cập nhật `storageService.ts` để không crash khi thiếu config

### 🎭 **Mock Data Service**
Ứng dụng hiện sử dụng dữ liệu giả lập bao gồm:
- 3 task mẫu với các trạng thái khác nhau
- Thống kê cá nhân và team
- Auto-move service cho scheduled tasks
- Storage service với mock operations

## ⚠️ Cấu hình Supabase (Tùy chọn)

Hiện tại ứng dụng đang chạy với **mock Supabase configuration**.

### Để sử dụng Supabase thực:

1. **Tạo Supabase Project** theo hướng dẫn trong `SUPABASE_SETUP.md`

2. **Cập nhật file `.env.local`**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-real-anon-key
VITE_SUPABASE_SERVICE_KEY=your-real-service-key
```

3. **Restart container**:
```bash
docker-compose restart app-dev
```

## 🚀 Môi trường khác

### Production:
```bash
docker-compose --profile prod up --build -d app-prod
# Chạy tại: http://localhost (port 80)
```

### Development + Supabase local:
```bash
docker-compose --profile dev --profile supabase up --build -d
# App: http://localhost:3000
# Supabase Studio: http://localhost:54321
```

## 🛠️ Troubleshooting

### Container không khởi động:
```bash
# Xem logs chi tiết
docker-compose logs app-dev

# Build lại từ đầu
docker-compose down
docker-compose --profile dev up --build app-dev
```

### Lỗi port đã được sử dụng:
```bash
# Kiểm tra process đang dùng port 3000
lsof -i :3000

# Dừng tất cả containers
docker-compose down
```

### Cập nhật code:
- Code thay đổi sẽ tự động reload nhờ volume mounting
- Không cần restart container khi sửa code

## 📝 Next Steps

1. ✅ **Web app đang chạy** - Kiểm tra các tính năng
2. 🔧 **Cấu hình Supabase** - Để sử dụng database thực
3. 🧪 **Viết tests** - Đảm bảo chất lượng code
4. 🚀 **Deploy production** - Khi sẵn sàng

Chúc bạn phát triển thành công! 🎯
