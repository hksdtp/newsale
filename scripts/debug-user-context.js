#!/usr/bin/env node

/**
 * 🔍 DEBUG USER CONTEXT
 * Kiểm tra tại sao Nguyễn Mạnh Linh không thấy tasks
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function debugUserContext() {
  console.log('🔍 Debug: Tại sao Nguyễn Mạnh Linh không thấy tasks...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Tìm user Nguyễn Mạnh Linh
    console.log('1️⃣ Tìm user Nguyễn Mạnh Linh...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .ilike('name', '%Nguyễn Mạnh Linh%');

    if (usersError) {
      console.error('❌ Lỗi khi tìm user:', usersError);
    } else {
      console.log(`📊 Tìm thấy ${users?.length || 0} user với tên tương tự:`);
      if (users && users.length > 0) {
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user.id} - Role: ${user.role}`);
        });
      } else {
        console.log('❌ Không tìm thấy user Nguyễn Mạnh Linh!');
        
        // Tìm tất cả users
        console.log('\n📋 Tất cả users trong hệ thống:');
        const { data: allUsers } = await supabase
          .from('users')
          .select('id, name, email, role')
          .order('name');
          
        if (allUsers) {
          allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
          });
        }
      }
    }

    // 2. Kiểm tra tasks và owners
    console.log('\n2️⃣ Kiểm tra tasks và owners...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, name, created_by_id, assigned_to_id')
      .limit(10);

    if (tasksError) {
      console.error('❌ Lỗi khi lấy tasks:', tasksError);
    } else {
      console.log(`📊 Có ${tasks?.length || 0} tasks trong hệ thống:`);
      if (tasks && tasks.length > 0) {
        for (const task of tasks.slice(0, 5)) {
          // Lấy thông tin user cho mỗi task
          const { data: createdBy } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', task.created_by_id)
            .single();
            
          const { data: assignedTo } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', task.assigned_to_id)
            .single();

          console.log(`   📝 ${task.name}`);
          console.log(`      Created by: ${createdBy?.name || 'Unknown'} (${task.created_by_id})`);
          console.log(`      Assigned to: ${assignedTo?.name || 'Unknown'} (${task.assigned_to_id})`);
        }
      }
    }

    // 3. Test function get_current_user_id_from_context
    console.log('\n3️⃣ Test function get_current_user_id_from_context...');
    
    // Giả lập set user context với một user ID có thật
    if (users && users.length > 0) {
      const testUserId = users[0].id;
      console.log(`🧪 Test với user ID: ${testUserId} (${users[0].name})`);
      
      // Set context
      const { error: setError } = await supabase.rpc('set_user_context', {
        user_uuid: testUserId
      });
      
      if (setError) {
        console.error('❌ Lỗi set context:', setError);
      } else {
        console.log('✅ Set context thành công');
        
        // Test get context
        const { data: contextResult, error: getError } = await supabase.rpc('get_current_user_id_from_context');
        
        if (getError) {
          console.error('❌ Lỗi get context:', getError);
        } else {
          console.log(`📋 Context result: ${contextResult}`);
          console.log(`🔍 Match: ${contextResult === testUserId ? 'YES' : 'NO'}`);
        }
      }
    }

    // 4. Đề xuất giải pháp
    console.log('\n4️⃣ Đề xuất giải pháp:');
    
    if (!users || users.length === 0) {
      console.log('🔧 GIẢI PHÁP 1: Thêm user Nguyễn Mạnh Linh vào database');
      console.log('   SQL để thêm user:');
      console.log(`
INSERT INTO users (name, email, password, role, location, department_type) 
VALUES (
  'Nguyễn Mạnh Linh', 
  'linh.nguyen@company.com', 
  '123456', 
  'employee', 
  'Hà Nội', 
  'Kinh doanh'
);`);
    } else {
      console.log('🔧 GIẢI PHÁP 2: Kiểm tra user context trong app');
      console.log('   - Đảm bảo authContextService.setUserContext() được gọi sau login');
      console.log('   - Kiểm tra localStorage có currentUserId không');
      console.log('   - Verify function set_user_context hoạt động');
    }

    console.log('\n🔧 GIẢI PHÁP 3: Tạo test tasks cho user');
    if (users && users.length > 0) {
      const userId = users[0].id;
      console.log(`   SQL để tạo test task cho ${users[0].name}:`);
      console.log(`
INSERT INTO tasks (name, description, created_by_id, assigned_to_id, status, priority) 
VALUES (
  'Test Task cho ${users[0].name}', 
  'Task test để kiểm tra RLS', 
  '${userId}', 
  '${userId}', 
  'pending', 
  'medium'
);`);
    }

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  debugUserContext();
}

module.exports = { debugUserContext };
