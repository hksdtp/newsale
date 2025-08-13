#!/usr/bin/env node

/**
 * 🔧 FIX CONTEXT FUNCTION
 * Khắc phục function get_current_user_id_from_context và tạo test data
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function fixContextFunction() {
  console.log('🔧 Khắc phục function context và tạo test data...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('📝 SQL cần chạy trong Supabase SQL Editor:\n');
    console.log('='.repeat(80));
    
    // 1. Fix function get_current_user_id_from_context
    console.log('-- 1. FIX FUNCTION get_current_user_id_from_context');
    console.log(`
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
    user_id_text := NULL;
  END;
  
  -- Debug log
  RAISE NOTICE 'get_current_user_id_from_context: user_id_text = %', user_id_text;
  
  -- Nếu không có hoặc rỗng, trả về NULL
  IF user_id_text IS NULL OR user_id_text = '' OR user_id_text = 'null' THEN
    RETURN NULL;
  END IF;
  
  -- Convert text to UUID
  BEGIN
    user_id := user_id_text::UUID;
    RAISE NOTICE 'get_current_user_id_from_context: converted UUID = %', user_id;
    RETURN user_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'get_current_user_id_from_context: conversion failed for %', user_id_text;
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_current_user_id_from_context() TO authenticated, anon;
`);

    console.log('\n-- 2. FIX FUNCTION set_user_context');
    console.log(`
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Set a custom setting that can be used in RLS policies
  PERFORM set_config('app.current_user_id', user_uuid::text, false);
  
  -- Debug log
  RAISE NOTICE 'set_user_context: set user_id = %', user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION set_user_context(UUID) TO authenticated, anon;
`);

    console.log('\n-- 3. TẠO TEST TASKS CHO NGUYỄN MẠNH LINH');
    console.log(`
-- Tạo test tasks cho Nguyễn Mạnh Linh
INSERT INTO tasks (
  name, 
  description, 
  created_by_id, 
  assigned_to_id, 
  status, 
  priority,
  work_type,
  department,
  team_id
) VALUES 
(
  'Task Test 1 - Nguyễn Mạnh Linh', 
  'Task test để kiểm tra RLS - tự tạo và tự làm', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  'pending', 
  'medium',
  'other',
  'HN',
  NULL
),
(
  'Task Test 2 - Nguyễn Mạnh Linh', 
  'Task test khác để kiểm tra RLS', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535', 
  'in_progress', 
  'high',
  'meeting',
  'HN',
  NULL
);
`);

    console.log('\n-- 4. TẠO TASKS CHO CÁC USER KHÁC (để test phân quyền)');
    console.log(`
-- Tạo tasks cho user khác để test phân quyền
INSERT INTO tasks (
  name, 
  description, 
  created_by_id, 
  assigned_to_id, 
  status, 
  priority,
  work_type,
  department
) VALUES 
(
  'Task của Nguyễn Thị Nga', 
  'Task này chỉ Nga mới thấy được', 
  (SELECT id FROM users WHERE name = 'Nguyễn Thị Nga' LIMIT 1), 
  (SELECT id FROM users WHERE name = 'Nguyễn Thị Nga' LIMIT 1), 
  'pending', 
  'medium',
  'other',
  'HN'
),
(
  'Task của Hà Nguyễn Thanh Tuyền', 
  'Task này chỉ Tuyền mới thấy được', 
  (SELECT id FROM users WHERE name = 'Hà Nguyễn Thanh Tuyền' LIMIT 1), 
  (SELECT id FROM users WHERE name = 'Hà Nguyễn Thanh Tuyền' LIMIT 1), 
  'pending', 
  'low',
  'other',
  'HN'
);
`);

    console.log('\n-- 5. TẠO TEMPORARY POLICY ĐỂ TEST');
    console.log(`
-- Tạm thời tạo policy đơn giản để test
DROP POLICY IF EXISTS "temp_test_policy" ON tasks;

CREATE POLICY "temp_test_policy" ON tasks
  FOR SELECT USING (
    -- Allow if user context matches created_by_id OR assigned_to_id
    created_by_id::text = current_setting('app.current_user_id', true)
    OR assigned_to_id::text = current_setting('app.current_user_id', true)
    -- OR allow all for debugging (remove this line after testing)
    OR current_setting('app.current_user_id', true) IS NOT NULL
  );
`);

    console.log('\n='.repeat(80));
    console.log('\n🔧 HƯỚNG DẪN THỰC HIỆN:');
    console.log('1. Copy toàn bộ SQL ở trên');
    console.log('2. Paste vào Supabase SQL Editor');
    console.log('3. Click "Run"');
    console.log('4. Refresh trang web app');
    console.log('5. Đăng nhập lại với Nguyễn Mạnh Linh');
    console.log('6. Kiểm tra có thấy 2 test tasks không');
    
    console.log('\n🧪 TEST STEPS:');
    console.log('1. Đăng nhập Nguyễn Mạnh Linh → Phải thấy 2 tasks');
    console.log('2. Đăng nhập user khác → Phải thấy tasks của họ');
    console.log('3. Kiểm tra console không có lỗi');

    console.log('\n⚠️  LƯU Ý:');
    console.log('- Policy "temp_test_policy" tạm thời cho phép xem nhiều tasks hơn');
    console.log('- Sau khi test OK, chúng ta sẽ tạo policy chính xác hơn');
    console.log('- Mục tiêu hiện tại: Đảm bảo user context hoạt động');

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  fixContextFunction();
}

module.exports = { fixContextFunction };
