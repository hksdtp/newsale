-- Migration to import real staff data
-- This temporarily disables RLS to import data, then re-enables it

-- Disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Clear existing data
DELETE FROM users;

-- Insert real staff data
INSERT INTO users (name, email, password, password_changed, location, role, department_type) VALUES
-- Director
('Khổng Đức Mạnh', 'manh.khong@company.com', '123456', false, 'Hà Nội', 'retail_director', 'Retail'),

-- Hà Nội Team Leaders
('Lương Việt Anh', 'anh.luong@company.com', '123456', false, 'Hà Nội', 'team_leader', 'Kinh doanh'),
('Nguyễn Thị Thảo', 'thao.nguyen@company.com', '123456', false, 'Hà Nội', 'team_leader', 'Kinh doanh'),
('Trịnh Thị Bốn', 'bon.trinh@company.com', '123456', false, 'Hà Nội', 'team_leader', 'Kinh doanh'),
('Phạm Thị Hương', 'huong.pham@company.com', '123456', false, 'Hà Nội', 'team_leader', 'Kinh doanh'),

-- Hà Nội Employees
('Lê Khánh Duy', 'duy.le@company.com', '123456', false, 'Hà Nội', 'employee', 'Sale'),
('Quản Thu Hà', 'ha.quan@company.com', '123456', false, 'Hà Nội', 'employee', 'Sale'),
('Nguyễn Mạnh Linh', 'linh.nguyen@company.com', '123456', false, 'Hà Nội', 'employee', 'Sale'),

-- TP.HCM Team Leaders
('Nguyễn Thị Nga', 'nga.nguyen@company.com', '123456', false, 'Hồ Chí Minh', 'team_leader', 'Kinh doanh'),
('Nguyễn Ngọc Việt Khanh', 'khanh.nguyen@company.com', '123456', false, 'Hồ Chí Minh', 'team_leader', 'Kinh doanh'),

-- TP.HCM Employees
('Hà Nguyễn Thanh Tuyền', 'tuyen.ha@company.com', '123456', false, 'Hồ Chí Minh', 'employee', 'Sale'),
('Phùng Thị Thùy Vân', 'van.phung@company.com', '123456', false, 'Hồ Chí Minh', 'employee', 'Sale');

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
