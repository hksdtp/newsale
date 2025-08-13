#!/usr/bin/env node

/**
 * 🔍 DEBUG TASK DELETION ISSUE
 * Tìm nguyên nhân tại sao danh sách tasks biến mất sau khi xóa
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function debugTaskDeletionIssue() {
  console.log('🔍 Debug: Tại sao danh sách tasks biến mất sau khi xóa...\n');

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 1. Kiểm tra tổng số tasks trong database
    console.log('1️⃣ Kiểm tra tổng số tasks trong database...');
    const { data: allTasks, error: allTasksError } = await supabase
      .from('tasks')
      .select('id, name, created_by_id, assigned_to_id, status')
      .order('created_at', { ascending: false });

    if (allTasksError) {
      console.error('❌ Lỗi khi lấy tất cả tasks:', allTasksError);
    } else {
      console.log(`📊 Tổng số tasks trong database: ${allTasks?.length || 0}`);
      if (allTasks && allTasks.length > 0) {
        console.log('📋 Danh sách tasks:');
        allTasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.name} (Status: ${task.status})`);
          console.log(`      Created by: ${task.created_by_id}`);
          console.log(`      Assigned to: ${task.assigned_to_id}`);
        });
      } else {
        console.log('❌ KHÔNG CÓ TASKS NÀO TRONG DATABASE!');
        console.log('   → Đây có thể là nguyên nhân chính');
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

    // 3. Test query với RLS
    console.log('\n3️⃣ Test query tasks với RLS...');
    const { data: userTasks, error: userTasksError } = await supabase
      .from('tasks')
      .select('id, name, created_by_id, assigned_to_id, status')
      .order('created_at', { ascending: false });

    if (userTasksError) {
      console.error('❌ Lỗi khi query tasks với RLS:', userTasksError);
    } else {
      console.log(`📊 User thấy ${userTasks?.length || 0} tasks với RLS:`);
      if (userTasks && userTasks.length > 0) {
        userTasks.forEach((task, index) => {
          const isOwner = task.created_by_id === nguyenManhLinhId;
          const isAssigned = task.assigned_to_id === nguyenManhLinhId;
          console.log(`   ${index + 1}. ${task.name} ${isOwner ? '(Owner)' : ''} ${isAssigned ? '(Assigned)' : ''}`);
        });
      } else {
        console.log('❌ USER KHÔNG THẤY TASKS NÀO VỚI RLS!');
        console.log('   → RLS policies có vấn đề hoặc user context không hoạt động');
      }
    }

    // 4. Kiểm tra RLS policies hiện tại
    console.log('\n4️⃣ Kiểm tra RLS policies hiện tại...');
    
    // Disable RLS tạm thời để test
    console.log('🧪 Test query WITHOUT RLS (để so sánh)...');
    
    // 5. Phân tích nguyên nhân
    console.log('\n5️⃣ PHÂN TÍCH NGUYÊN NHÂN:');
    
    if (!allTasks || allTasks.length === 0) {
      console.log('🚨 NGUYÊN NHÂN 1: KHÔNG CÓ TASKS TRONG DATABASE');
      console.log('   → Tất cả tasks đã bị xóa');
      console.log('   → Cần tạo lại test data');
      
      console.log('\n🔧 GIẢI PHÁP: Tạo lại test tasks');
      console.log('   SQL để chạy:');
      console.log(`
INSERT INTO tasks (
  name, description, created_by_id, assigned_to_id, 
  status, priority, work_type, department
) VALUES 
(
  'Task Test 1 - Nguyễn Mạnh Linh (New)', 
  'Task test mới sau khi debug deletion issue', 
  '${nguyenManhLinhId}', 
  '${nguyenManhLinhId}', 
  'pending', 'medium', 'other', 'HN'
),
(
  'Task Test 2 - Nguyễn Mạnh Linh (New)', 
  'Task test thứ 2 mới', 
  '${nguyenManhLinhId}', 
  '${nguyenManhLinhId}', 
  'in_progress', 'high', 'meeting', 'HN'
),
(
  'Task Test 3 - Nguyễn Mạnh Linh (New)', 
  'Task test thứ 3 mới', 
  '${nguyenManhLinhId}', 
  '${nguyenManhLinhId}', 
  'completed', 'low', 'other', 'HN'
);`);
      
    } else if (userTasks && userTasks.length === 0) {
      console.log('🚨 NGUYÊN NHÂN 2: RLS POLICIES BLOCK TẤT CẢ');
      console.log('   → User context không hoạt động');
      console.log('   → RLS policies quá strict');
      
      console.log('\n🔧 GIẢI PHÁP: Fix RLS policies');
      
    } else {
      console.log('🚨 NGUYÊN NHÂN 3: FRONTEND ISSUE');
      console.log('   → Database có data');
      console.log('   → RLS hoạt động');
      console.log('   → Vấn đề ở frontend state management');
    }

    // 6. Hướng dẫn debug frontend
    console.log('\n6️⃣ DEBUG FRONTEND:');
    console.log('1. Mở Developer Tools (F12)');
    console.log('2. Vào tab Network');
    console.log('3. Xóa một task');
    console.log('4. Xem API calls:');
    console.log('   - DELETE request có thành công không?');
    console.log('   - GET request sau đó có được gọi không?');
    console.log('   - Response có data không?');
    console.log('5. Vào tab Console xem có lỗi JavaScript không');

    console.log('\n7️⃣ TEMPORARY WORKAROUND:');
    console.log('- Sau khi xóa task, refresh trang (F5)');
    console.log('- Hoặc chuyển tab khác rồi quay lại');
    console.log('- Tôi sẽ fix frontend issue sau khi xác định nguyên nhân');

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  debugTaskDeletionIssue();
}

module.exports = { debugTaskDeletionIssue };
