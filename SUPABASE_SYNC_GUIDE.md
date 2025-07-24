# 📚 HƯỚNG DẪN ĐỒNG BỘ HOÀN CHỈNH VỚI SUPABASE

## 🎯 Tổng Quan

Ứng dụng đã được cập nhật để đồng bộ hoàn toàn với Supabase:

### ✅ Đã Hoàn Thành

1. **TaskService** - Đã chuyển từ localStorage sang Supabase
   - ✅ Tạo task mới
   - ✅ Lấy danh sách tasks
   - ✅ Cập nhật task
   - ✅ Xóa task
   - ✅ Lọc tasks theo scope (my-tasks, team-tasks, department-tasks)

2. **AuthService** - Đã tích hợp với Supabase
   - ✅ Đăng nhập với email/password
   - ✅ Đổi mật khẩu lần đầu
   - ✅ Lấy danh sách users
   - ✅ Lấy thông tin teams

3. **Database Schema** - Đã cập nhật
   - ✅ Table `users` với đầy đủ fields
   - ✅ Table `tasks` với share_scope
   - ✅ Table `teams`
   - ✅ Indexes và RLS policies

## 🚀 Hướng Dẫn Triển Khai

### Bước 1: Chạy Migration SQL

1. Mở [Supabase SQL Editor](https://app.supabase.com/project/YOUR_PROJECT_ID/sql)

2. Chạy script thêm column `share_scope` (nếu chưa có):
   ```sql
   -- Copy nội dung từ: database/add_share_scope_column.sql
   ```

3. Kiểm tra lại bằng script test:
   ```bash
   node scripts/test-db-sync.js
   ```

### Bước 2: Test Ứng Dụng

1. Khởi động ứng dụng:
   ```bash
   npm run dev
   ```

2. Đăng nhập với một trong các tài khoản:
   - `manh.khong@example.com` / `123456` (Director)
   - `khanhduy@example.com` / `123456` (Employee)
   - `huong.pham@example.com` / `123456` (Team Leader)

3. Test các chức năng:
   - ✅ Tạo công việc mới
   - ✅ Xem danh sách công việc
   - ✅ Sửa công việc
   - ✅ Xóa công việc
   - ✅ Lọc theo tab (Của Tôi, Của Nhóm, Công việc chung)

## 🔧 Cấu Trúc Database

### Users Table
```sql
- id: UUID (Primary Key)
- email: VARCHAR(255) UNIQUE
- name: VARCHAR(255)
- password: VARCHAR(255)
- password_changed: BOOLEAN
- team_id: UUID (Foreign Key)
- location: VARCHAR(50)
- role: VARCHAR(50)
- department_type: VARCHAR(50)
- last_login: TIMESTAMP
```

### Tasks Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(500)
- description: TEXT
- work_type: VARCHAR(50)
- priority: VARCHAR(20)
- status: VARCHAR(50)
- share_scope: VARCHAR(20) -- 'private', 'team', 'public'
- created_by_id: UUID (Foreign Key)
- assigned_to_id: UUID (Foreign Key)
- team_id: UUID (Foreign Key)
- department: VARCHAR(10)
```

### Teams Table
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255)
- description: TEXT
```

## 📋 Checklist Kiểm Tra

- [ ] Supabase project đã được tạo
- [ ] File `.env.local` có VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
- [ ] Database có table `users` (không phải `members`)
- [ ] Table `tasks` có column `share_scope`
- [ ] Có ít nhất 1 user để test đăng nhập
- [ ] RLS policies đã được enable

## 🐛 Troubleshooting

### Lỗi "relation users does not exist"
→ Chạy migration script trong `database/migrate_to_users_table.sql`

### Lỗi "column share_scope does not exist"
→ Chạy script trong `database/add_share_scope_column.sql`

### Lỗi đăng nhập
→ Kiểm tra:
- Email có tồn tại trong database không
- Password mặc định là `123456`
- Field `password_changed` = false cho lần đăng nhập đầu

### Tasks không lưu được
→ Kiểm tra:
- Console browser có lỗi không
- Network tab xem request có fail không
- RLS policies cho table tasks

## 🎉 Kết Luận

Ứng dụng giờ đã:
- ✅ Đồng bộ 2 chiều với Supabase
- ✅ Không còn phụ thuộc localStorage cho tasks
- ✅ Authentication hoạt động với database thật
- ✅ Hỗ trợ phân quyền theo role và team

Nếu gặp vấn đề, hãy chạy:
```bash
node scripts/test-db-sync.js
```

Để kiểm tra trạng thái đồng bộ!
