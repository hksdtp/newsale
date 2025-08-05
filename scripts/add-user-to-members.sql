-- Kiểm tra xem user Khổng Đức Mạnh có trong bảng users không
SELECT id, name, email, team_id, location 
FROM users 
WHERE id = '43a0d2d2-0297-4a6a-bbeb-d19b6986bd26';

-- Kiểm tra xem user này có trong bảng members không
SELECT id, name, email 
FROM members 
WHERE id = '43a0d2d2-0297-4a6a-bbeb-d19b6986bd26';

-- Thêm user vào bảng members nếu chưa có
INSERT INTO members (id, name, email) 
SELECT id, name, email
FROM users 
WHERE id = '43a0d2d2-0297-4a6a-bbeb-d19b6986bd26'
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    email = EXCLUDED.email;

-- Thêm tất cả users vào members table để đồng bộ
INSERT INTO members (id, name, email)
SELECT id, name, email
FROM users
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    email = EXCLUDED.email;

-- Kiểm tra lại
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_members FROM members;
