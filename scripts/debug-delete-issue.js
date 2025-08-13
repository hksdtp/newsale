#!/usr/bin/env node

/**
 * 🔍 DEBUG DELETE ISSUE
 * Kiểm tra tại sao danh sách tasks biến mất sau khi xóa
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function debugDeleteIssue() {
  console.log('🔍 Debug: Tại sao danh sách tasks biến mất sau khi xóa...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Kiểm tra tasks hiện tại
    console.log('1️⃣ Kiểm tra tasks hiện tại...');
    const { data: currentTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id, name, created_by_id, assigned_to_id')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('❌ Lỗi khi lấy tasks:', tasksError);
    } else {
      console.log(`📊 Có ${currentTasks?.length || 0} tasks trong database:`);
      if (currentTasks && currentTasks.length > 0) {
        currentTasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.name} (ID: ${task.id.substring(0, 8)}...)`);
        });
      } else {
        console.log('❌ Không có tasks nào trong database!');
      }
    }

    // 2. Test user context với Nguyễn Mạnh Linh
    console.log('\n2️⃣ Test user context với Nguyễn Mạnh Linh...');
    const nguyenManhLinhId = '3e1aa0d1-d98a-4eb5-b8ff-5e8956757535';
    
    // Set context
    const { error: setError } = await supabase.rpc('set_user_context', {
      user_uuid: nguyenManhLinhId
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
        console.log(`🔍 Match: ${contextResult === nguyenManhLinhId ? 'YES' : 'NO'}`);
      }
    }

    // 3. Test query tasks với user context
    console.log('\n3️⃣ Test query tasks với user context...');
    const { data: userTasks, error: userTasksError } = await supabase
      .from('tasks')
      .select('id, name, created_by_id, assigned_to_id')
      .order('created_at', { ascending: false });

    if (userTasksError) {
      console.error('❌ Lỗi khi query tasks với user context:', userTasksError);
    } else {
      console.log(`📊 User thấy ${userTasks?.length || 0} tasks:`);
      if (userTasks && userTasks.length > 0) {
        userTasks.forEach((task, index) => {
          const isOwner = task.created_by_id === nguyenManhLinhId;
          const isAssigned = task.assigned_to_id === nguyenManhLinhId;
          console.log(`   ${index + 1}. ${task.name} ${isOwner ? '(Owner)' : ''} ${isAssigned ? '(Assigned)' : ''}`);
        });
      } else {
        console.log('❌ User không thấy tasks nào!');
      }
    }

    // 4. Kiểm tra RLS policies
    console.log('\n4️⃣ Kiểm tra RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'tasks')
      .order('policyname');

    if (policiesError) {
      console.error('❌ Lỗi khi lấy policies:', policiesError);
    } else {
      console.log(`📋 Có ${policies?.length || 0} policies cho bảng tasks:`);
      if (policies && policies.length > 0) {
        policies.forEach((policy, index) => {
          console.log(`   ${index + 1}. ${policy.policyname} (${policy.cmd})`);
        });
      }
    }

    // 5. Đề xuất giải pháp
    console.log('\n5️⃣ Phân tích và đề xuất giải pháp:');
    
    if (!currentTasks || currentTasks.length === 0) {
      console.log('🔧 VẤN ĐỀ: Không có tasks nào trong database');
      console.log('   GIẢI PHÁP: Tạo lại test tasks');
      console.log('   SQL để tạo lại:');
      console.log(`
INSERT INTO tasks (
  name, description, created_by_id, assigned_to_id, 
  status, priority, work_type, department
) VALUES 
(
  'Task Test 1 - Nguyễn Mạnh Linh (Restored)', 
  'Task test được tạo lại sau khi debug', 
  '${nguyenManhLinhId}', 
  '${nguyenManhLinhId}', 
  'pending', 'medium', 'other', 'HN'
),
(
  'Task Test 2 - Nguyễn Mạnh Linh (Restored)', 
  'Task test thứ 2 được tạo lại', 
  '${nguyenManhLinhId}', 
  '${nguyenManhLinhId}', 
  'in_progress', 'high', 'meeting', 'HN'
);`);
    } else if (userTasks && userTasks.length === 0) {
      console.log('🔧 VẤN ĐỀ: RLS policies quá strict hoặc user context không hoạt động');
      console.log('   GIẢI PHÁP: Kiểm tra và fix policies');
    } else {
      console.log('🔧 VẤN ĐỀ: Có thể là frontend issue');
      console.log('   GIẢI PHÁP: Kiểm tra frontend state management');
    }

    console.log('\n6️⃣ Hướng dẫn debug frontend:');
    console.log('1. Mở Developer Tools (F12)');
    console.log('2. Vào tab Console');
    console.log('3. Xóa một task và xem logs');
    console.log('4. Kiểm tra có lỗi gì trong console không');
    console.log('5. Kiểm tra Network tab xem API calls');

    console.log('\n7️⃣ Temporary workaround:');
    console.log('- Refresh trang (F5) sau khi xóa task');
    console.log('- Hoặc chuyển tab rồi quay lại');
    console.log('- Tôi sẽ fix frontend issue sau khi xác định nguyên nhân');

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  debugDeleteIssue();
}

module.exports = { debugDeleteIssue };
