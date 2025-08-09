# 🔐 Hướng Dẫn Hệ Thống Phân Quyền

## 📋 Tổng Quan

Hệ thống phân quyền được thiết kế để kiểm soát ai có thể chỉnh sửa, xóa và quản lý công việc trong ứng dụng.

## 🎯 Các Khái Niệm Cơ Bản

### 1. **Role-based Permissions** (Phân quyền theo vai trò)

- **Ý nghĩa**: Phân quyền dựa trên vai trò/chức vụ của người dùng
- **Các vai trò**:
  - `admin`: Quản trị viên - có quyền chỉnh sửa TẤT CẢ công việc
  - `manager`: Quản lý - có quyền chỉnh sửa TẤT CẢ công việc
  - `retail_director`: Giám đốc bán lẻ - có quyền chỉnh sửa TẤT CẢ công việc
  - `employee`: Nhân viên - chỉ chỉnh sửa được công việc do mình tạo

### 2. **Cache** (Bộ nhớ đệm)

- **Ý nghĩa**: Lưu trữ tạm thời kết quả kiểm tra quyền để tăng tốc độ
- **Lợi ích**: Không cần kiểm tra lại quyền liên tục, giảm thời gian xử lý
- **Thời gian**: Cache được lưu trong 5 phút

### 3. **Audit Log** (Nhật ký kiểm toán)

- **Ý nghĩa**: Ghi lại tất cả hành động truy cập trái phép
- **Thông tin ghi**: Ai, làm gì, khi nào, với công việc nào
- **Mục đích**: Theo dõi và phát hiện hành vi bất thường

### 4. **Real-time Updates** (Cập nhật thời gian thực)

- **Ý nghĩa**: Khi có thay đổi quyền sở hữu, hệ thống cập nhật ngay lập tức
- **Cách hoạt động**: Xóa cache cũ khi có thay đổi để đảm bảo quyền được kiểm tra lại

## 🔧 Cách Hoạt Động

### Quy Trình Kiểm Tra Quyền:

1. **Kiểm tra cache** - Nếu có kết quả cũ (dưới 5 phút) thì dùng luôn
2. **Kiểm tra vai trò** - Admin/Manager có quyền với tất cả công việc
3. **Kiểm tra chủ sở hữu** - Người tạo công việc có quyền chỉnh sửa
4. **Lưu vào cache** - Lưu kết quả để lần sau dùng lại
5. **Ghi log** - Nếu truy cập trái phép thì ghi nhật ký

### Các Quyền Cụ Thể:

- ✏️ **canEdit**: Chỉnh sửa tên, mô tả công việc
- 🗑️ **canDelete**: Xóa công việc
- 📊 **canChangeStatus**: Thay đổi trạng thái (Chưa làm/Đang làm/Hoàn thành)
- ⚡ **canChangePriority**: Thay đổi mức độ ưu tiên (Thấp/Bình thường/Cao)
- 🏷️ **canChangeWorkType**: Thay đổi loại công việc
- 👥 **canAssign**: Giao việc cho người khác

## 💡 Ví Dụ Thực Tế

### Trường Hợp 1: Nhân Viên Bình Thường

```
Nguyễn Văn A (employee) tạo công việc "Thiết kế banner"
→ Nguyễn Văn A: Có thể chỉnh sửa, xóa
→ Nguyễn Văn B: Chỉ xem được, không chỉnh sửa được
→ Lê Thị C (manager): Có thể chỉnh sửa, xóa (vì là manager)
```

### Trường Hợp 2: Manager/Admin

```
Trần Văn D (manager) đăng nhập
→ Có thể chỉnh sửa TẤT CẢ công việc của mọi người
→ Không cần phải là người tạo ra công việc
```

### Trường Hợp 3: Truy Cập Trái Phép

```
Nguyễn Văn B cố gắng xóa công việc của Nguyễn Văn A
→ Hệ thống từ chối
→ Hiện thông báo lỗi
→ Ghi log: "Nguyễn Văn B cố gắng xóa công việc 'Thiết kế banner' lúc 14:30"
```

## 🚀 Tính Năng Nâng Cao

### Cache Thông Minh:

- Tự động xóa cache khi có thay đổi
- Tiết kiệm thời gian xử lý
- Đảm bảo dữ liệu luôn chính xác

### Theo Dõi Bảo Mật:

- Ghi lại mọi hành động trái phép
- Có thể xuất báo cáo bảo mật
- Phát hiện sớm hành vi bất thường

### Giao Diện Thông Minh:

- Tự động ẩn/hiện nút Edit/Delete
- Disable form khi không có quyền
- Thông báo rõ ràng về quyền hạn

## 🔍 Debug và Troubleshooting

### Kiểm Tra Quyền:

```javascript
// Trong console của trình duyệt
const permissions = getTaskPermissions(task);
console.log(permissions);
```

### Xóa Cache:

```javascript
// Xóa cache cho task cụ thể
clearPermissionCache('task-id-123');

// Xóa toàn bộ cache
clearPermissionCache();
```

### Xem Log:

- Mở Developer Tools → Console
- Tìm các log có icon 🔐 (kiểm tra quyền) và 🚨 (truy cập trái phép)
