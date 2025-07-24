# 🚀 Hướng dẫn Setup Supabase

## 1. Tạo Supabase Project

1. Truy cập [supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập tài khoản
3. Click **"New Project"**
4. Chọn Organization và nhập thông tin:
   - **Name**: `qatalog-login` (hoặc tên bạn muốn)
   - **Database Password**: Tạo password mạnh
   - **Region**: Chọn gần Việt Nam nhất (Singapore)
5. Click **"Create new project"**

## 2. Lấy thông tin kết nối

Sau khi project được tạo:

1. Vào **Settings** → **API**
2. Copy các thông tin sau:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Cấu hình Environment Variables

1. Mở file `.env.local` trong project
2. Thay thế thông tin:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. Tạo Database Schema

1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy toàn bộ nội dung file `database/schema.sql`
3. Paste vào SQL Editor và click **"Run"**

## 5. Kiểm tra Database

Sau khi chạy SQL script, bạn sẽ có:

### Tables:
- **teams**: Thông tin team/nhóm
- **locations**: Địa điểm làm việc
- **members**: Thành viên team

### Sample Data:
- **1 team**: "Development Team"
- **3 locations**: Hà Nội Office, TP.HCM Office, Remote
- **4 members**: Admin + 3 thành viên với password mặc định "123456"

## 6. Kiểm tra setup

Chạy script kiểm tra:
```bash
npm run setup:supabase
```

## 7. Test kết nối

1. Restart development server: `npm run dev`
2. Mở browser tại `http://localhost:3000`
3. Kiểm tra Console để xem kết quả test connection
4. Thử đăng nhập với:
   - **Email**: `admin@company.com`
   - **Password**: `123456`

## 8. Danh sách 10 thành viên mẫu

| Email | Tên | Mật khẩu | Vai trò | Địa điểm |
|-------|-----|----------|---------|----------|
| admin@company.com | Admin User | 123456 | admin | Hà Nội Office |
| nguyen@company.com | Nguyễn Văn A | 123456 | member | Hà Nội Office |
| tran@company.com | Trần Thị B | 123456 | member | TP.HCM Office |
| le@company.com | Lê Văn C | 123456 | member | Remote |
| pham@company.com | Phạm Văn D | 123456 | member | Hà Nội Office |
| hoang@company.com | Hoàng Thị E | 123456 | member | TP.HCM Office |
| vu@company.com | Vũ Văn F | 123456 | member | Remote |
| do@company.com | Đỗ Thị G | 123456 | member | Hà Nội Office |
| bui@company.com | Bùi Văn H | 123456 | member | TP.HCM Office |
| dang@company.com | Đặng Thị I | 123456 | member | Remote |

## 7. Cấu trúc Database

```sql
teams
├── id (UUID, Primary Key)
├── name (VARCHAR, Unique)
├── description (TEXT)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

locations
├── id (UUID, Primary Key)
├── name (VARCHAR)
├── address (TEXT)
├── team_id (UUID, Foreign Key → teams.id)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)

members
├── id (UUID, Primary Key)
├── email (VARCHAR, Unique)
├── name (VARCHAR)
├── team_id (UUID, Foreign Key → teams.id)
├── location_id (UUID, Foreign Key → locations.id)
├── password_hash (VARCHAR)
├── is_first_login (BOOLEAN)
├── role (ENUM: 'admin', 'member')
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── last_login (TIMESTAMP)
```

## 8. Security Features

- ✅ **Row Level Security (RLS)** enabled
- ✅ **Password hashing** với bcrypt
- ✅ **JWT authentication**
- ✅ **Team-based access control**

## 9. Troubleshooting

### Lỗi kết nối:
- Kiểm tra VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
- Đảm bảo project Supabase đã được tạo thành công

### Lỗi database:
- Kiểm tra SQL script đã chạy thành công
- Xem logs trong Supabase Dashboard

### Lỗi authentication:
- Kiểm tra RLS policies đã được tạo
- Verify sample data đã được insert

## 10. Next Steps

Sau khi setup thành công, bạn có thể:
- Thêm thành viên mới vào database
- Tùy chỉnh teams và locations
- Phát triển thêm features authentication
