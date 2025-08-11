-- Script để tạo NHÓM 5 và đồng bộ dữ liệu
-- Chạy script này trong Supabase SQL Editor
-- Ngày tạo: 2025-01-11

-- 1. Kiểm tra cấu trúc bảng teams hiện tại
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'teams' 
ORDER BY ordinal_position;

-- 2. Kiểm tra các teams hiện có
SELECT id, name, location, description, created_at
FROM teams 
ORDER BY name;

-- 3. Tạo NHÓM 5 mới (nếu chưa tồn tại)
INSERT INTO teams (name, location, description, created_at, updated_at)
VALUES (
  'NHÓM 5 - Mai Tiến Đạt',
  'HN',
  'Nhóm kinh doanh Hà Nội 5',
  NOW(),
  NOW()
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- 4. Lấy ID của NHÓM 5 vừa tạo
SELECT id, name, location, description 
FROM teams 
WHERE name = 'NHÓM 5 - Mai Tiến Đạt';

-- 5. Kiểm tra xem Mai Tiến Đạt đã tồn tại chưa
SELECT id, name, email, role, team_id, location, department_type
FROM users 
WHERE email = 'dat.mai@company.com';

-- 6. Thêm Mai Tiến Đạt làm trưởng nhóm (nếu chưa tồn tại)
INSERT INTO users (
  name,
  email,
  password,
  password_changed,
  team_id,
  location,
  role,
  department_type,
  created_at,
  updated_at
) VALUES (
  'Mai Tiến Đạt',
  'dat.mai@company.com',
  '123456',
  false,
  (SELECT id FROM teams WHERE name = 'NHÓM 5 - Mai Tiến Đạt' LIMIT 1),
  'Hà Nội',
  'team_leader',
  'Kinh doanh',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  team_id = EXCLUDED.team_id,
  location = EXCLUDED.location,
  role = EXCLUDED.role,
  department_type = EXCLUDED.department_type,
  updated_at = NOW();

-- 7. Kiểm tra kết quả - Hiển thị tất cả teams tại Hà Nội
SELECT 
  t.id,
  t.name as team_name,
  t.location,
  t.description,
  COUNT(u.id) as member_count,
  STRING_AGG(
    u.name || ' (' || 
    CASE u.role 
      WHEN 'team_leader' THEN 'Trưởng nhóm'
      WHEN 'employee' THEN 'Nhân viên'
      WHEN 'retail_director' THEN 'Giám đốc'
      ELSE u.role
    END || ')', 
    ', ' ORDER BY 
      CASE u.role 
        WHEN 'retail_director' THEN 1
        WHEN 'team_leader' THEN 2
        WHEN 'employee' THEN 3
        ELSE 4
      END,
      u.name
  ) as members
FROM teams t
LEFT JOIN users u ON t.id = u.team_id AND u.location = 'Hà Nội'
WHERE t.location = 'HN' OR EXISTS (
  SELECT 1 FROM users u2 WHERE u2.team_id = t.id AND u2.location = 'Hà Nội'
)
GROUP BY t.id, t.name, t.location, t.description
ORDER BY t.name;

-- 8. Hiển thị thông tin chi tiết NHÓM 5
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.location,
  u.department_type,
  t.name as team_name,
  t.description as team_description
FROM users u
JOIN teams t ON u.team_id = t.id
WHERE t.name = 'NHÓM 5 - Mai Tiến Đạt'
ORDER BY 
  CASE u.role 
    WHEN 'team_leader' THEN 1
    WHEN 'employee' THEN 2
    ELSE 3
  END,
  u.name;

-- 9. Thống kê tổng quan
SELECT 
  'Tổng số teams' as metric,
  COUNT(*) as value
FROM teams
UNION ALL
SELECT 
  'Teams tại Hà Nội' as metric,
  COUNT(*) as value
FROM teams 
WHERE location = 'HN'
UNION ALL
SELECT 
  'Tổng số users' as metric,
  COUNT(*) as value
FROM users
UNION ALL
SELECT 
  'Users tại Hà Nội' as metric,
  COUNT(*) as value
FROM users 
WHERE location = 'Hà Nội'
UNION ALL
SELECT 
  'Trưởng nhóm' as metric,
  COUNT(*) as value
FROM users 
WHERE role = 'team_leader'
UNION ALL
SELECT 
  'Nhân viên' as metric,
  COUNT(*) as value
FROM users 
WHERE role = 'employee';

-- 10. Xác nhận tạo thành công
DO $$
DECLARE
  team_exists BOOLEAN;
  user_exists BOOLEAN;
  team_name TEXT;
  user_role TEXT;
  team_id UUID;
BEGIN
  -- Kiểm tra nhóm đã được tạo
  SELECT EXISTS(SELECT 1 FROM teams WHERE name = 'NHÓM 5 - Mai Tiến Đạt'), 
         MAX(name),
         MAX(id)
  INTO team_exists, team_name, team_id
  FROM teams WHERE name = 'NHÓM 5 - Mai Tiến Đạt';
  
  -- Kiểm tra user đã được thêm
  SELECT EXISTS(SELECT 1 FROM users u JOIN teams t ON u.team_id = t.id 
                WHERE u.email = 'dat.mai@company.com' AND t.name = 'NHÓM 5 - Mai Tiến Đạt'),
         MAX(u.role)
  INTO user_exists, user_role
  FROM users u 
  JOIN teams t ON u.team_id = t.id
  WHERE u.email = 'dat.mai@company.com' AND t.name = 'NHÓM 5 - Mai Tiến Đạt';
  
  RAISE NOTICE '';
  RAISE NOTICE '=== KẾT QUẢ TẠO NHÓM 5 ===';
  RAISE NOTICE '';
  
  IF team_exists AND user_exists THEN
    RAISE NOTICE '🎉 THÀNH CÔNG!';
    RAISE NOTICE '✅ Đã tạo nhóm: %', team_name;
    RAISE NOTICE '✅ Team ID: %', team_id;
    RAISE NOTICE '✅ Đã thêm Mai Tiến Đạt làm %', 
      CASE user_role 
        WHEN 'team_leader' THEN 'Trưởng nhóm'
        WHEN 'employee' THEN 'Nhân viên'
        ELSE user_role
      END;
    RAISE NOTICE '';
    RAISE NOTICE '📋 Bây giờ bạn có thể:';
    RAISE NOTICE '   - Refresh trang web để thấy NHÓM 5';
    RAISE NOTICE '   - Đăng nhập với email: dat.mai@company.com';
    RAISE NOTICE '   - Mật khẩu: 123456';
    RAISE NOTICE '   - Thêm thành viên vào NHÓM 5 qua giao diện quản lý';
  ELSE
    RAISE NOTICE '❌ CÓ LỖI XẢY RA:';
    RAISE NOTICE '   - Nhóm tồn tại: %', team_exists;
    RAISE NOTICE '   - User tồn tại: %', user_exists;
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Hãy kiểm tra lại các bước trên';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=========================';
END $$;
