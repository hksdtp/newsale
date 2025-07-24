# 🚀 Quick Start Guide

## ✅ Bước 1: Supabase đã được cấu hình

Credentials đã được setup:
- **Project ID**: fnakxavwxubnbucfoujd
- **URL**: https://fnakxavwxubnbucfoujd.supabase.co
- **Anon Key**: Đã cấu hình trong .env.local

## 📋 Bước 2: Import Database Schema

### Cách 1: Copy-Paste (Khuyến nghị)

1. **Mở Supabase SQL Editor**:
   ```
   https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql
   ```

2. **Copy toàn bộ nội dung** từ file `database/schema.sql`

3. **Paste vào SQL Editor** và click **"Run"**

### Cách 2: Upload File

1. Vào SQL Editor
2. Click **"Upload SQL file"**
3. Chọn file `database/schema.sql`
4. Click **"Run"**

## 🎯 Bước 3: Kiểm tra Database

Sau khi import thành công, bạn sẽ có:

### Tables:
- **teams** (1 record): Development Team
- **locations** (3 records): Hà Nội Office, TP.HCM Office, Remote  
- **members** (10 records): Admin + 9 thành viên

### Sample Data:
| Email | Tên | Password | Role | Location |
|-------|-----|----------|------|----------|
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

## 🧪 Bước 4: Test Ứng dụng

1. **Mở browser**: http://localhost:3000

2. **Kiểm tra Console**: Xem kết quả connection test

3. **Test đăng nhập**:
   - Chọn user từ danh sách
   - Nhập password: `123456`
   - Vào dashboard

## 🔧 Troubleshooting

### Lỗi "Missing Supabase environment variables"
- Kiểm tra file `.env.local` có đúng format
- Restart development server: `npm run dev`

### Lỗi "Failed to fetch members"
- Đảm bảo đã import SQL schema thành công
- Kiểm tra tables đã được tạo trong Supabase Dashboard

### Lỗi "Email không tồn tại"
- Kiểm tra table `members` có data
- Thử với email: `admin@company.com`

### Lỗi kết nối
- Kiểm tra URL và API key trong `.env.local`
- Đảm bảo Supabase project đang active

## 📚 Commands

```bash
# Kiểm tra cấu hình
npm run setup:supabase

# Start development server  
npm run dev

# Build for production
npm run build
```

## 🎯 Flow Ứng dụng

1. **User Selection** → Chọn từ 10 thành viên
2. **Password Input** → Nhập password (123456)
3. **First Login Check** → Nếu lần đầu → đổi password
4. **Dashboard** → Vào trang chính với session persistence

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled
- ✅ Team-based access control  
- ✅ Session persistence với localStorage
- ✅ Password validation
- ✅ Error boundaries và loading states

---

**🎉 Sau khi hoàn thành các bước trên, ứng dụng sẽ hoạt động hoàn toàn với Supabase!**
