#!/usr/bin/env node

/**
 * 🔒 FIX RLS SECURITY - FINAL SOLUTION
 * Khắc phục hoàn toàn vấn đề bảo mật RLS cho bảng tasks
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function fixRLSSecurity() {
  console.log('🔒 Bắt đầu khắc phục bảo mật RLS cho bảng tasks...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Step 1: Xóa tất cả policies không an toàn
    console.log('1️⃣ Xóa các policies không an toàn...');
    
    const dropPoliciesSQL = `
-- Xóa tất cả policies hiện tại cho bảng tasks
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow read with app filtering" ON tasks;
DROP POLICY IF EXISTS "Allow read for app functionality" ON tasks;
DROP POLICY IF EXISTS "Allow task creation" ON tasks;
DROP POLICY IF EXISTS "Allow task updates" ON tasks;
DROP POLICY IF EXISTS "Allow task deletion" ON tasks;
DROP POLICY IF EXISTS "Restrict task creation" ON tasks;
DROP POLICY IF EXISTS "Restrict task updates" ON tasks;
DROP POLICY IF EXISTS "Temporary lockdown" ON tasks;

-- Xóa các policies cũ khác
DROP POLICY IF EXISTS "Users can view their own created tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view public tasks in same department" ON tasks;
DROP POLICY IF EXISTS "Users can view team tasks in same team" ON tasks;
DROP POLICY IF EXISTS "Directors can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Assigned users can update task status" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Directors can delete any task" ON tasks;
DROP POLICY IF EXISTS "Custom auth: Users can view their own created tasks" ON tasks;
DROP POLICY IF EXISTS "Custom auth: Users can view assigned tasks" ON tasks;
`;

    console.log('📝 Đang xóa policies cũ...');
    
    // Step 2: Tạo function helper để lấy user ID từ custom context
    console.log('\n2️⃣ Tạo helper functions...');
    
    const helperFunctionsSQL = `
-- Function để lấy current user ID từ custom context
CREATE OR REPLACE FUNCTION get_current_user_id_from_context()
RETURNS UUID AS $$
DECLARE
  user_id_text TEXT;
  user_id UUID;
BEGIN
  -- Lấy user ID từ custom setting
  user_id_text := current_setting('app.current_user_id', true);
  
  -- Nếu không có hoặc rỗng, trả về NULL
  IF user_id_text IS NULL OR user_id_text = '' THEN
    RETURN NULL;
  END IF;
  
  -- Convert text to UUID
  BEGIN
    user_id := user_id_text::UUID;
    RETURN user_id;
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_current_user_id_from_context() TO authenticated, anon;
`;

    console.log('📝 Đang tạo helper functions...');

    // Step 3: Tạo secure RLS policies
    console.log('\n3️⃣ Tạo secure RLS policies...');
    
    const securePoliciesSQL = `
-- 🔒 SECURE RLS POLICIES FOR TASKS TABLE

-- Policy 1: Users can view tasks they created
CREATE POLICY "secure_view_own_created_tasks" ON tasks
  FOR SELECT USING (
    created_by_id = get_current_user_id_from_context()
  );

-- Policy 2: Users can view tasks assigned to them
CREATE POLICY "secure_view_assigned_tasks" ON tasks
  FOR SELECT USING (
    assigned_to_id = get_current_user_id_from_context()
  );

-- Policy 3: Directors can view all tasks (retail_director role)
CREATE POLICY "secure_directors_view_all" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id_from_context()
      AND role = 'retail_director'
    )
  );

-- Policy 4: Team leaders can view team tasks
CREATE POLICY "secure_team_leaders_view_team_tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id_from_context()
      AND role = 'team_leader'
      AND team_id = tasks.team_id
    )
  );

-- INSERT policies
CREATE POLICY "secure_create_own_tasks" ON tasks
  FOR INSERT WITH CHECK (
    created_by_id = get_current_user_id_from_context()
  );

-- UPDATE policies
CREATE POLICY "secure_update_own_tasks" ON tasks
  FOR UPDATE USING (
    created_by_id = get_current_user_id_from_context()
    OR assigned_to_id = get_current_user_id_from_context()
  );

-- DELETE policies
CREATE POLICY "secure_delete_own_tasks" ON tasks
  FOR DELETE USING (
    created_by_id = get_current_user_id_from_context()
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id = get_current_user_id_from_context()
      AND role IN ('retail_director', 'team_leader')
    )
  );
`;

    console.log('📝 Đang tạo secure policies...');

    // Chạy tất cả SQL statements
    const allSQL = dropPoliciesSQL + helperFunctionsSQL + securePoliciesSQL;
    
    // Thử chạy từng phần
    const sqlParts = [
      { name: 'Drop Policies', sql: dropPoliciesSQL },
      { name: 'Helper Functions', sql: helperFunctionsSQL },
      { name: 'Secure Policies', sql: securePoliciesSQL }
    ];

    for (const part of sqlParts) {
      console.log(`\n📝 Đang chạy: ${part.name}...`);
      console.log('='.repeat(60));
      console.log('Vui lòng copy đoạn SQL sau vào Supabase SQL Editor:');
      console.log(part.sql);
      console.log('='.repeat(60));
    }

    // Step 4: Đảm bảo RLS được bật
    console.log('\n4️⃣ Đảm bảo RLS được bật...');
    const enableRLSSQL = `
-- Đảm bảo RLS được bật cho bảng tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
`;
    
    console.log('📝 SQL để bật RLS:');
    console.log('='.repeat(60));
    console.log(enableRLSSQL);
    console.log('='.repeat(60));

    // Step 5: Hướng dẫn test
    console.log('\n5️⃣ Hướng dẫn test bảo mật:');
    console.log('1. Mở Supabase SQL Editor: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql');
    console.log('2. Copy và chạy từng đoạn SQL ở trên theo thứ tự');
    console.log('3. Refresh trang web app');
    console.log('4. Đăng nhập với các tài khoản khác nhau để test');
    console.log('5. Kiểm tra mỗi user chỉ thấy tasks của mình');

    console.log('\n✅ Script hoàn thành! Vui lòng thực hiện các bước trên để khắc phục bảo mật.');

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  fixRLSSecurity();
}

module.exports = { fixRLSSecurity };
