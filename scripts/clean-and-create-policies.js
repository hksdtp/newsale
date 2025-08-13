#!/usr/bin/env node

/**
 * 🧹 CLEAN AND CREATE POLICIES
 * Xóa tất cả policies cũ và tạo mới hoàn toàn
 */

async function cleanAndCreatePolicies() {
  console.log('🧹 Xóa tất cả policies cũ và tạo mới...\n');

  console.log('📝 SQL cần chạy trong Supabase SQL Editor:\n');
  console.log('='.repeat(80));
  
  console.log('-- 🧹 CLEAN ALL EXISTING POLICIES FIRST');
  console.log(`
-- Xóa TẤT CẢ policies hiện tại cho bảng tasks
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
DROP POLICY IF EXISTS "temp_test_policy" ON tasks;

-- Xóa các secure policies cũ
DROP POLICY IF EXISTS "secure_view_own_created_tasks" ON tasks;
DROP POLICY IF EXISTS "secure_view_assigned_tasks" ON tasks;
DROP POLICY IF EXISTS "secure_team_leaders_view_team_tasks" ON tasks;
DROP POLICY IF EXISTS "secure_directors_view_all_tasks" ON tasks;
DROP POLICY IF EXISTS "secure_create_own_tasks" ON tasks;
DROP POLICY IF EXISTS "secure_update_own_or_assigned_tasks" ON tasks;
DROP POLICY IF EXISTS "secure_delete_own_or_team_tasks" ON tasks;

-- Xóa các policies khác có thể tồn tại
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
`);

  console.log('-- 🔒 CREATE BRAND NEW SECURE POLICIES');
  console.log(`
-- Policy 1: Users can view tasks they created
CREATE POLICY "final_view_own_created_tasks" ON tasks
  FOR SELECT USING (
    created_by_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 2: Users can view tasks assigned to them
CREATE POLICY "final_view_assigned_tasks" ON tasks
  FOR SELECT USING (
    assigned_to_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 3: Team leaders can view all tasks in their team
CREATE POLICY "final_team_leaders_view_team_tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true)
      AND role = 'team_leader'
      AND team_id = tasks.team_id
    )
  );

-- Policy 4: Directors can view all tasks
CREATE POLICY "final_directors_view_all_tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true)
      AND role = 'retail_director'
    )
  );

-- Policy 5: Users can create tasks (must set themselves as creator)
CREATE POLICY "final_create_own_tasks" ON tasks
  FOR INSERT WITH CHECK (
    created_by_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 6: Users can update their own tasks or assigned tasks
CREATE POLICY "final_update_own_or_assigned_tasks" ON tasks
  FOR UPDATE USING (
    created_by_id::text = current_setting('app.current_user_id', true)
    OR assigned_to_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 7: Users can delete their own tasks, team leaders can delete team tasks
CREATE POLICY "final_delete_own_or_team_tasks" ON tasks
  FOR DELETE USING (
    created_by_id::text = current_setting('app.current_user_id', true)
    OR EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true)
      AND (
        role = 'retail_director' 
        OR (role = 'team_leader' AND team_id = tasks.team_id)
      )
    )
  );
`);

  console.log('-- ✅ ENABLE RLS AND VERIFY');
  console.log(`
-- Đảm bảo RLS được bật
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Kiểm tra policies đã tạo
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'tasks'
ORDER BY policyname;
`);

  console.log('='.repeat(80));
  console.log('\n🔧 HƯỚNG DẪN THỰC HIỆN:');
  console.log('1. Copy toàn bộ SQL ở trên');
  console.log('2. Paste vào Supabase SQL Editor');
  console.log('3. Click "Run"');
  console.log('4. Kiểm tra kết quả query cuối cùng - phải thấy 7 policies mới');
  console.log('5. Refresh trang web app');
  console.log('6. Test với Nguyễn Mạnh Linh');

  console.log('\n🧪 KẾT QUẢ MONG ĐỢI:');
  console.log('📋 Query cuối cùng sẽ hiển thị 7 policies:');
  console.log('   - final_view_own_created_tasks');
  console.log('   - final_view_assigned_tasks');
  console.log('   - final_team_leaders_view_team_tasks');
  console.log('   - final_directors_view_all_tasks');
  console.log('   - final_create_own_tasks');
  console.log('   - final_update_own_or_assigned_tasks');
  console.log('   - final_delete_own_or_team_tasks');

  console.log('\n📋 Nguyễn Mạnh Linh sẽ chỉ thấy:');
  console.log('   ✅ 2 test tasks của mình');
  console.log('   ❌ KHÔNG thấy tasks của người khác');

  console.log('\n⚠️  QUAN TRỌNG:');
  console.log('- Tên policies mới bắt đầu với "final_" để tránh trùng');
  console.log('- Đây là bản cuối cùng, đã xóa sạch tất cả policies cũ');
  console.log('- Nếu vẫn có lỗi, báo ngay để tôi debug');
}

// Chạy script
if (require.main === module) {
  cleanAndCreatePolicies();
}

module.exports = { cleanAndCreatePolicies };
