#!/usr/bin/env node

/**
 * 🔒 CREATE FINAL SECURE POLICIES
 * Tạo policies bảo mật cuối cùng - mỗi user chỉ thấy tasks của mình
 */

async function createFinalSecurePolicies() {
  console.log('🔒 Tạo FINAL SECURE POLICIES cho bảng tasks...\n');

  console.log('📝 SQL cần chạy trong Supabase SQL Editor:\n');
  console.log('='.repeat(80));
  
  console.log('-- 🔒 FINAL SECURE RLS POLICIES FOR TASKS TABLE');
  console.log('-- Mỗi user chỉ thấy tasks của mình, team leaders thấy tasks của team');
  console.log('');

  // 1. Xóa policy tạm thời
  console.log('-- 1. XÓA POLICY TẠM THỜI');
  console.log(`
DROP POLICY IF EXISTS "temp_test_policy" ON tasks;
`);

  // 2. Tạo secure policies
  console.log('-- 2. TẠO SECURE POLICIES');
  console.log(`
-- Policy 1: Users can view tasks they created
CREATE POLICY "secure_view_own_created_tasks" ON tasks
  FOR SELECT USING (
    created_by_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 2: Users can view tasks assigned to them
CREATE POLICY "secure_view_assigned_tasks" ON tasks
  FOR SELECT USING (
    assigned_to_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 3: Team leaders can view all tasks in their team
CREATE POLICY "secure_team_leaders_view_team_tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true)
      AND role = 'team_leader'
      AND team_id = tasks.team_id
    )
  );

-- Policy 4: Directors can view all tasks
CREATE POLICY "secure_directors_view_all_tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = current_setting('app.current_user_id', true)
      AND role = 'retail_director'
    )
  );

-- Policy 5: Users can create tasks (must set themselves as creator)
CREATE POLICY "secure_create_own_tasks" ON tasks
  FOR INSERT WITH CHECK (
    created_by_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 6: Users can update their own tasks or assigned tasks
CREATE POLICY "secure_update_own_or_assigned_tasks" ON tasks
  FOR UPDATE USING (
    created_by_id::text = current_setting('app.current_user_id', true)
    OR assigned_to_id::text = current_setting('app.current_user_id', true)
  );

-- Policy 7: Users can delete their own tasks, team leaders can delete team tasks
CREATE POLICY "secure_delete_own_or_team_tasks" ON tasks
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

  console.log('-- 3. ĐẢM BẢO RLS ĐƯỢC BẬT');
  console.log(`
-- Đảm bảo RLS được bật
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
`);

  console.log('='.repeat(80));
  console.log('\n🔧 HƯỚNG DẪN THỰC HIỆN:');
  console.log('1. Copy toàn bộ SQL ở trên');
  console.log('2. Paste vào Supabase SQL Editor');
  console.log('3. Click "Run"');
  console.log('4. Refresh trang web app');
  console.log('5. Test với các tài khoản khác nhau');

  console.log('\n🧪 KẾT QUẢ MONG ĐỢI:');
  console.log('📋 Nguyễn Mạnh Linh (employee):');
  console.log('   ✅ Thấy: 2 test tasks của mình');
  console.log('   ❌ KHÔNG thấy: Tasks của người khác');
  
  console.log('\n📋 Nguyễn Thị Nga (team_leader):');
  console.log('   ✅ Thấy: Tasks của mình + tasks trong team');
  console.log('   ❌ KHÔNG thấy: Tasks của team khác');

  console.log('\n📋 Retail Director (nếu có):');
  console.log('   ✅ Thấy: TẤT CẢ tasks');

  console.log('\n⚠️  QUAN TRỌNG:');
  console.log('- Sau khi chạy SQL này, mỗi user chỉ thấy tasks phù hợp với quyền hạn');
  console.log('- Đây là bảo mật CHÍNH THỨC, không còn policy tạm thời');
  console.log('- Nếu có vấn đề, báo ngay để điều chỉnh');

  console.log('\n🔍 DEBUG:');
  console.log('- Nếu user không thấy tasks nào: Kiểm tra user context có được set không');
  console.log('- Nếu thấy quá nhiều tasks: Có thể còn policy cũ, cần xóa');
  console.log('- Kiểm tra console logs để debug');
}

// Chạy script
if (require.main === module) {
  createFinalSecurePolicies();
}

module.exports = { createFinalSecurePolicies };
