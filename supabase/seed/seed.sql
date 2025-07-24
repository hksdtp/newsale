-- Seed data for development and testing

-- Clear existing data (in reverse order of dependencies)
DELETE FROM tasks;
DELETE FROM members;
DELETE FROM teams;

-- Insert teams
INSERT INTO teams (id, name, location, description) VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'NHÓM 1', 'HN', 'Nhóm phát triển sản phẩm tại Hà Nội'),
  ('550e8400-e29b-41d4-a716-446655440002', 'NHÓM 2', 'HN', 'Nhóm marketing tại Hà Nội'),
  ('550e8400-e29b-41d4-a716-446655440003', 'NHÓM 3', 'HCM', 'Nhóm kinh doanh tại Hồ Chí Minh'),
  ('550e8400-e29b-41d4-a716-446655440004', 'NHÓM 4', 'HCM', 'Nhóm vận hành tại Hồ Chí Minh'),
  ('550e8400-e29b-41d4-a716-446655440005', 'NHÓM 5', 'HN', 'Nhóm công nghệ thông tin'),
  ('550e8400-e29b-41d4-a716-446655440006', 'NHÓM 6', 'HCM', 'Nhóm chăm sóc khách hàng');

-- Insert members
INSERT INTO members (id, name, email, team_id, role, location) VALUES 
  -- Team 1 (HN)
  ('660e8400-e29b-41d4-a716-446655440001', 'Nguyễn Văn An', 'an.nguyen@company.com', '550e8400-e29b-41d4-a716-446655440001', 'leader', 'HN'),
  ('660e8400-e29b-41d4-a716-446655440002', 'Trần Thị Bình', 'binh.tran@company.com', '550e8400-e29b-41d4-a716-446655440001', 'member', 'HN'),
  ('660e8400-e29b-41d4-a716-446655440003', 'Lê Văn Cường', 'cuong.le@company.com', '550e8400-e29b-41d4-a716-446655440001', 'member', 'HN'),
  
  -- Team 2 (HN)
  ('660e8400-e29b-41d4-a716-446655440004', 'Phạm Thị Dung', 'dung.pham@company.com', '550e8400-e29b-41d4-a716-446655440002', 'leader', 'HN'),
  ('660e8400-e29b-41d4-a716-446655440005', 'Hoàng Văn Em', 'em.hoang@company.com', '550e8400-e29b-41d4-a716-446655440002', 'member', 'HN'),
  
  -- Team 3 (HCM)
  ('660e8400-e29b-41d4-a716-446655440006', 'Võ Thị Phương', 'phuong.vo@company.com', '550e8400-e29b-41d4-a716-446655440003', 'leader', 'HCM'),
  ('660e8400-e29b-41d4-a716-446655440007', 'Đặng Văn Giang', 'giang.dang@company.com', '550e8400-e29b-41d4-a716-446655440003', 'member', 'HCM'),
  ('660e8400-e29b-41d4-a716-446655440008', 'Bùi Thị Hoa', 'hoa.bui@company.com', '550e8400-e29b-41d4-a716-446655440003', 'member', 'HCM'),
  
  -- Team 4 (HCM)
  ('660e8400-e29b-41d4-a716-446655440009', 'Ngô Văn Ích', 'ich.ngo@company.com', '550e8400-e29b-41d4-a716-446655440004', 'leader', 'HCM'),
  ('660e8400-e29b-41d4-a716-446655440010', 'Lý Thị Kim', 'kim.ly@company.com', '550e8400-e29b-41d4-a716-446655440004', 'member', 'HCM'),
  
  -- Team 5 (HN) - Empty team for testing
  ('660e8400-e29b-41d4-a716-446655440011', 'Trịnh Văn Long', 'long.trinh@company.com', '550e8400-e29b-41d4-a716-446655440005', 'leader', 'HN'),
  
  -- Team 6 (HCM) - Empty team for testing
  ('660e8400-e29b-41d4-a716-446655440012', 'Đinh Thị Mai', 'mai.dinh@company.com', '550e8400-e29b-41d4-a716-446655440006', 'leader', 'HCM');

-- Insert sample tasks
INSERT INTO tasks (id, name, description, work_type, priority, status, campaign_type, platform, start_date, due_date, created_by_id, assigned_to_id, team_id, department, share_scope) VALUES 
  -- Team 1 tasks
  ('770e8400-e29b-41d4-a716-446655440001', 'Phát triển tính năng đăng nhập', 'Xây dựng hệ thống đăng nhập với xác thực 2 lớp', 'sbg-new', 'high', 'approved', 'Authentication', ARRAY['Web', 'Mobile'], '2025-01-15', '2025-01-30', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'HN', 'team'),
  
  ('770e8400-e29b-41d4-a716-446655440002', 'Tối ưu hóa database', 'Cải thiện hiệu suất truy vấn database', 'other', 'normal', 'new-requests', 'Performance', ARRAY['Backend'], '2025-01-20', '2025-02-05', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'HN', 'team'),
  
  -- Team 2 tasks
  ('770e8400-e29b-41d4-a716-446655440003', 'Chiến dịch marketing Q1', 'Lập kế hoạch và triển khai chiến dịch marketing quý 1', 'partner-new', 'high', 'live', 'Q1 Campaign', ARRAY['Facebook', 'Google Ads', 'TikTok'], '2025-01-01', '2025-03-31', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'HN', 'public'),
  
  -- Team 3 tasks
  ('770e8400-e29b-41d4-a716-446655440004', 'Mở rộng thị trường miền Nam', 'Nghiên cứu và triển khai kế hoạch mở rộng', 'customer-new', 'high', 'approved', 'Market Expansion', ARRAY['Direct Sales', 'Online'], '2025-01-10', '2025-04-30', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'HCM', 'team'),
  
  ('770e8400-e29b-41d4-a716-446655440005', 'Phân tích đối thủ cạnh tranh', 'Nghiên cứu và phân tích các đối thủ chính', 'kts-new', 'normal', 'new-requests', 'Competitive Analysis', ARRAY['Research'], '2025-01-25', '2025-02-15', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440003', 'HCM', 'team'),
  
  -- Team 4 tasks
  ('770e8400-e29b-41d4-a716-446655440006', 'Cải thiện quy trình vận hành', 'Tối ưu hóa quy trình làm việc nội bộ', 'other', 'normal', 'approved', 'Process Improvement', ARRAY['Internal'], '2025-01-12', '2025-02-28', '660e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440004', 'HCM', 'team'),
  
  -- Public tasks
  ('770e8400-e29b-41d4-a716-446655440007', 'Đào tạo nhân viên mới', 'Chương trình đào tạo cho nhân viên mới tuyển dụng', 'other', 'normal', 'new-requests', 'Training', ARRAY['Internal'], '2025-02-01', '2025-02-20', '660e8400-e29b-41d4-a716-446655440001', NULL, NULL, 'HN', 'public'),
  
  ('770e8400-e29b-41d4-a716-446655440008', 'Họp tổng kết quý', 'Tổ chức họp tổng kết và lập kế hoạch quý mới', 'other', 'low', 'new-requests', 'Meeting', ARRAY['Internal'], '2025-03-25', '2025-03-30', '660e8400-e29b-41d4-a716-446655440004', NULL, NULL, 'HCM', 'public');

-- Update sequences to avoid conflicts
SELECT setval(pg_get_serial_sequence('teams', 'id'), (SELECT MAX(id::text)::int FROM teams WHERE id::text ~ '^[0-9]+$') + 1, false);
SELECT setval(pg_get_serial_sequence('members', 'id'), (SELECT MAX(id::text)::int FROM members WHERE id::text ~ '^[0-9]+$') + 1, false);
SELECT setval(pg_get_serial_sequence('tasks', 'id'), (SELECT MAX(id::text)::int FROM tasks WHERE id::text ~ '^[0-9]+$') + 1, false);
