#!/usr/bin/env node

/**
 * 🔧 RESTORE TASKS AND FIX CONTEXT
 * Khôi phục tasks và fix function context
 */

async function restoreTasksAndFixContext() {
  console.log('🔧 Khôi phục tasks và fix context function...\n');

  console.log('📝 SQL cần chạy trong Supabase SQL Editor:\n');
  console.log('='.repeat(80));
  
  console.log('-- 🔧 1. FIX CONTEXT FUNCTIONS (LẦN CUỐI)');
  console.log(`
-- Fix function set_user_context
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Set a custom setting that can be used in RLS policies
  -- Sử dụng session-level setting (false parameter)
  PERFORM set_config('app.current_user_id', user_uuid::text, false);
  
  -- Debug log
  RAISE NOTICE 'set_user_context: set user_id = %', user_uuid;
  
  -- Verify setting was set
  RAISE NOTICE 'set_user_context: verify setting = %', current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix function get_current_user_id_from_context
CREATE OR REPLACE FUNCTION get_current_user_id_from_context()
RETURNS UUID AS $$
DECLARE
  user_id_text TEXT;
  user_id UUID;
BEGIN
  -- Lấy user ID từ custom setting
  BEGIN
    user_id_text := current_setting('app.current_user_id', false);
  EXCEPTION WHEN OTHERS THEN
    -- Nếu setting không tồn tại, thử với missing_ok = true
    BEGIN
      user_id_text := current_setting('app.current_user_id', true);
    EXCEPTION WHEN OTHERS THEN
      user_id_text := NULL;
    END;
  END;
  
  -- Debug log
  RAISE NOTICE 'get_current_user_id_from_context: user_id_text = "%"', user_id_text;
  
  -- Nếu không có hoặc rỗng, trả về NULL
  IF user_id_text IS NULL OR user_id_text = '' OR user_id_text = 'null' THEN
    RAISE NOTICE 'get_current_user_id_from_context: returning NULL (empty or null)';
    RETURN NULL;
  END IF;
  
  -- Convert text to UUID
  BEGIN
    user_id := user_id_text::UUID;
    RAISE NOTICE 'get_current_user_id_from_context: converted UUID = %', user_id;
    RETURN user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'get_current_user_id_from_context: conversion failed for "%"', user_id_text;
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION set_user_context(UUID) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_current_user_id_from_context() TO authenticated, anon;
`);

  console.log('-- 🔧 2. TẠO LẠI TEST TASKS');
  console.log(`
-- Tạo lại test tasks cho Nguyễn Mạnh Linh
INSERT INTO tasks (
  name, description, created_by_id, assigned_to_id, 
  status, priority, work_type, department
) VALUES 
(
  'Task Test 1 - Nguyễn Mạnh Linh (Restored)', 
  'Task test được tạo lại sau khi debug - tự tạo và tự làm', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  'pending', 'medium', 'other', 'HN'
),
(
  'Task Test 2 - Nguyễn Mạnh Linh (Restored)', 
  'Task test thứ 2 được tạo lại - tự tạo và tự làm', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  'in_progress', 'high', 'meeting', 'HN'
),
(
  'Task Test 3 - Nguyễn Mạnh Linh (Restored)', 
  'Task test thứ 3 để đảm bảo có đủ data', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  'completed', 'low', 'other', 'HN'
);
`);

  console.log('-- 🔧 3. TẠO TASKS CHO CÁC USER KHÁC (để test phân quyền)');
  console.log(`
-- Tạo tasks cho các user khác để test RLS
INSERT INTO tasks (
  name, description, created_by_id, assigned_to_id, 
  status, priority, work_type, department
) VALUES 
(
  'Task của Nguyễn Thị Nga (Test RLS)', 
  'Task này chỉ Nga mới thấy được', 
  (SELECT id FROM users WHERE name = 'Nguyễn Thị Nga' LIMIT 1), 
  (SELECT id FROM users WHERE name = 'Nguyễn Thị Nga' LIMIT 1), 
  'pending', 'medium', 'other', 'HN'
),
(
  'Task của Hà Nguyễn Thanh Tuyền (Test RLS)', 
  'Task này chỉ Tuyền mới thấy được', 
  (SELECT id FROM users WHERE name = 'Hà Nguyễn Thanh Tuyền' LIMIT 1), 
  (SELECT id FROM users WHERE name = 'Hà Nguyễn Thanh Tuyền' LIMIT 1), 
  'pending', 'low', 'other', 'HN'
),
(
  'Task của Nguyễn Ngọc Việt Khanh (Test RLS)', 
  'Task này chỉ Khanh mới thấy được', 
  (SELECT id FROM users WHERE name = 'Nguyễn Ngọc Việt Khanh' LIMIT 1), 
  (SELECT id FROM users WHERE name = 'Nguyễn Ngọc Việt Khanh' LIMIT 1), 
  'in_progress', 'high', 'meeting', 'HN'
);
`);

  console.log('-- 🔧 4. TEST FUNCTIONS');
  console.log(`
-- Test set và get context functions
DO $$
DECLARE
  test_user_id UUID := '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535';
  result_user_id UUID;
BEGIN
  -- Test set context
  PERFORM set_user_context(test_user_id);
  
  -- Test get context
  result_user_id := get_current_user_id_from_context();
  
  -- Log results
  RAISE NOTICE 'TEST RESULTS:';
  RAISE NOTICE 'Input user ID: %', test_user_id;
  RAISE NOTICE 'Output user ID: %', result_user_id;
  RAISE NOTICE 'Match: %', CASE WHEN test_user_id = result_user_id THEN 'YES' ELSE 'NO' END;
END $$;
`);

  console.log('-- 🔧 5. VERIFY DATA');
  console.log(`
-- Kiểm tra tasks đã được tạo
SELECT 
  id, 
  name, 
  created_by_id,
  (SELECT name FROM users WHERE id = tasks.created_by_id) as creator_name,
  status
FROM tasks 
ORDER BY created_at DESC;
`);

  console.log('='.repeat(80));
  console.log('\n🔧 HƯỚNG DẪN THỰC HIỆN:');
  console.log('1. Copy toàn bộ SQL ở trên');
  console.log('2. Paste vào Supabase SQL Editor');
  console.log('3. Click "Run"');
  console.log('4. Kiểm tra kết quả test functions - phải thấy "Match: YES"');
  console.log('5. Kiểm tra query cuối - phải thấy 6 tasks mới');
  console.log('6. Refresh trang web app');
  console.log('7. Đăng nhập với Nguyễn Mạnh Linh');

  console.log('\n🧪 KẾT QUẢ MONG ĐỢI:');
  console.log('📋 Test functions: Match = YES');
  console.log('📋 Query cuối: 6 tasks (3 của Nguyễn Mạnh Linh + 3 của users khác)');
  console.log('📋 Nguyễn Mạnh Linh: Chỉ thấy 3 tasks của mình');
  console.log('📋 Users khác: Chỉ thấy tasks của họ');

  console.log('\n⚠️  QUAN TRỌNG:');
  console.log('- Functions đã được fix với debug logs chi tiết');
  console.log('- Test data đã được tạo lại');
  console.log('- Nếu vẫn có vấn đề, check console logs để debug');
  console.log('- Sau khi test OK, có thể tắt debug logs');

  console.log('\n🔍 DEBUG TIPS:');
  console.log('- Mở browser console để xem debug logs');
  console.log('- Nếu function test fail, có vấn đề với PostgreSQL settings');
  console.log('- Nếu RLS không hoạt động, check policies');
}

// Chạy script
if (require.main === module) {
  restoreTasksAndFixContext();
}

module.exports = { restoreTasksAndFixContext };
