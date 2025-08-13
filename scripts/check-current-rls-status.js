#!/usr/bin/env node

/**
 * 🔍 CHECK CURRENT RLS STATUS
 * Kiểm tra trạng thái hiện tại của RLS policies cho bảng tasks
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function checkRLSStatus() {
  console.log('🔍 Kiểm tra trạng thái RLS hiện tại...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Kiểm tra RLS có được bật không
    console.log('1️⃣ Kiểm tra RLS có được bật cho bảng tasks...');

    // 2. Kiểm tra các policies hiện tại
    console.log('\n2️⃣ Kiểm tra các RLS policies hiện tại...');

    // 3. Test query để xem có bao nhiêu tasks được trả về
    console.log('\n3️⃣ Test query tasks...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, name, created_by_id, assigned_to_id, share_scope')
      .limit(10);

    if (tasksError) {
      console.error('❌ Lỗi khi query tasks:', tasksError);
    } else {
      console.log(`📊 Số lượng tasks trả về: ${tasks?.length || 0}`);
      if (tasks && tasks.length > 0) {
        console.log('📋 Sample tasks:');
        tasks.slice(0, 5).forEach((task, index) => {
          console.log(
            `   ${index + 1}. ${task.name} (created_by: ${task.created_by_id}, assigned_to: ${task.assigned_to_id})`
          );
        });
      }
    }

    // 4. Kiểm tra user context hiện tại
    console.log('\n4️⃣ Kiểm tra user context...');
    console.log(`👤 Current User ID: KHÔNG CÓ (chạy từ Node.js)`);

    // 5. Test function set_user_context
    console.log('\n5️⃣ Test function set_user_context...');
    const { error: contextError } = await supabase.rpc('set_user_context', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
    });

    if (contextError) {
      console.error('❌ Function set_user_context không hoạt động:', contextError);
    } else {
      console.log('✅ Function set_user_context hoạt động bình thường');
    }

    // 6. Kiểm tra users table
    console.log('\n6️⃣ Kiểm tra users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role')
      .limit(5);

    if (usersError) {
      console.error('❌ Lỗi khi query users:', usersError);
    } else {
      console.log(`👥 Số lượng users: ${users?.length || 0}`);
      if (users && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  checkRLSStatus();
}

module.exports = { checkRLSStatus };
