-- Script SQL để tạo NHÓM 5 mới và thêm Mai Tiến Đạt làm Trưởng nhóm
-- Chạy script này trong Supabase SQL Editor hoặc database console
-- Ngày tạo: 2025-01-11

-- 1. Kiểm tra xem NHÓM 5 đã tồn tại chưa
SELECT
  id,
  name,
  location,
  description
FROM teams
WHERE name LIKE '%NHÓM 5%' OR name = 'NHÓM 5';

-- 2. Tạo NHÓM 5 mới (nếu chưa tồn tại)
INSERT INTO teams (
  name,
  location,
  description,
  created_at,
  updated_at
) VALUES (
  'NHÓM 5 - Mai Tiến Đạt',
  'HN',
  'Nhóm kinh doanh Hà Nội 5',
  NOW(),
  NOW()
) ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = NOW();

-- 3. Kiểm tra xem email Mai Tiến Đạt đã tồn tại chưa
SELECT
  id,
  name,
  email,
  team_id,
  location,
  role
FROM users
WHERE email = 'dat.mai@company.com';

-- 4. Thêm Mai Tiến Đạt vào bảng users với vai trò TRƯỞNG NHÓM
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
  '123456', -- Mật khẩu mặc định
  false,
  (SELECT id FROM teams WHERE name = 'NHÓM 5 - Mai Tiến Đạt' LIMIT 1),
  'Hà Nội',
  'team_leader', -- TRƯỞNG NHÓM
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

-- 4. Thêm vào bảng members (nếu bảng này tồn tại)
INSERT INTO members (
  id,
  name,
  email,
  team_id,
  role,
  location,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  u.name,
  u.email,
  u.team_id,
  'member',
  'HN',
  true,
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'dat.mai@company.com'
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  team_id = EXCLUDED.team_id,
  role = EXCLUDED.role,
  location = EXCLUDED.location,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 5. Kiểm tra kết quả - Hiển thị thông tin NHÓM 5 mới tạo
SELECT
  u.id,
  u.name,
  u.email,
  u.role,
  u.location,
  u.department_type,
  t.name as team_name
FROM users u
JOIN teams t ON u.team_id = t.id
WHERE t.name LIKE '%NHÓM 5%'
ORDER BY
  CASE u.role
    WHEN 'team_leader' THEN 1
    WHEN 'employee' THEN 2
    ELSE 3
  END,
  u.name;

-- 6. Hiển thị tất cả các nhóm tại Hà Nội và số thành viên
SELECT
  t.name as team_name,
  t.location,
  COUNT(u.id) as member_count,
  STRING_AGG(
    u.name || ' (' ||
    CASE u.role
      WHEN 'team_leader' THEN 'Trưởng nhóm'
      WHEN 'employee' THEN 'Nhân viên'
      ELSE u.role
    END || ')',
    ', ' ORDER BY
      CASE u.role
        WHEN 'team_leader' THEN 1
        WHEN 'employee' THEN 2
        ELSE 3
      END,
      u.name
  ) as members
FROM teams t
LEFT JOIN users u ON t.id = u.team_id AND u.location = 'Hà Nội'
WHERE t.location = 'HN' OR EXISTS (
  SELECT 1 FROM users u2 WHERE u2.team_id = t.id AND u2.location = 'Hà Nội'
)
GROUP BY t.id, t.name, t.location
ORDER BY t.name;

-- 7. Xác nhận tạo nhóm và thêm trưởng nhóm thành công
DO $$
DECLARE
  team_exists BOOLEAN;
  user_exists BOOLEAN;
  team_name TEXT;
  user_role TEXT;
BEGIN
  -- Kiểm tra nhóm đã được tạo
  SELECT EXISTS(SELECT 1 FROM teams WHERE name LIKE '%NHÓM 5%'),
         MAX(name)
  INTO team_exists, team_name
  FROM teams WHERE name LIKE '%NHÓM 5%';

  -- Kiểm tra user đã được thêm
  SELECT EXISTS(SELECT 1 FROM users u JOIN teams t ON u.team_id = t.id
                WHERE u.email = 'dat.mai@company.com' AND t.name LIKE '%NHÓM 5%'),
         MAX(u.role)
  INTO user_exists, user_role
  FROM users u
  JOIN teams t ON u.team_id = t.id
  WHERE u.email = 'dat.mai@company.com' AND t.name LIKE '%NHÓM 5%';

  IF team_exists AND user_exists THEN
    RAISE NOTICE '🎉 THÀNH CÔNG!';
    RAISE NOTICE '✅ Đã tạo nhóm: %', team_name;
    RAISE NOTICE '✅ Đã thêm Mai Tiến Đạt làm % của nhóm',
      CASE user_role
        WHEN 'team_leader' THEN 'Trưởng nhóm'
        WHEN 'employee' THEN 'Nhân viên'
        ELSE user_role
      END;
  ELSE
    RAISE NOTICE '❌ Có lỗi xảy ra:';
    RAISE NOTICE '   - Nhóm tồn tại: %', team_exists;
    RAISE NOTICE '   - User tồn tại: %', user_exists;
  END IF;
END $$;
