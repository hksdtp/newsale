#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testTaskCreation() {
  console.log('🧪 Test tạo công việc mới...');
  
  try {
    // Lấy ID của Phạm Thị Hương
    const phamThiHuongId = '82e76766-0500-43ef-aeb4-f5936746daf4';
    
    // Tạo task test
    const testTask = {
      name: 'Test Task - ' + new Date().toLocaleTimeString(),
      description: 'Đây là task test để kiểm tra khả năng tạo công việc',
      work_type: 'consultation',
      priority: 'normal',
      status: 'new-requests',
      start_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 ngày sau
      created_by_id: phamThiHuongId,
      assigned_to_id: phamThiHuongId,
      department: 'sales',
      share_scope: 'team'
    };
    
    console.log('📝 Đang tạo task:', testTask.name);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testTask)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ TẠO TASK THÀNH CÔNG!');
      console.log('   - ID:', result[0]?.id);
      console.log('   - Name:', result[0]?.name);
      console.log('   - Status:', result[0]?.status);
      
      // Test cập nhật task
      console.log('\n🔄 Test cập nhật task...');
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${result[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Mô tả đã được cập nhật - ' + new Date().toLocaleTimeString()
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ CẬP NHẬT TASK THÀNH CÔNG!');
      } else {
        const updateError = await updateResponse.json();
        console.log('❌ Lỗi cập nhật task:', updateError);
      }
      
    } else {
      console.log('❌ LỖI TẠO TASK:');
      console.log('   - Status:', response.status);
      console.log('   - Error:', result);
      
      if (result.code === '42501') {
        console.log('\n🚨 LỖI RLS POLICY!');
        console.log('   Cần chạy SQL fix trong Supabase Dashboard:');
        console.log('   DROP POLICY IF EXISTS "Restrict task creation" ON tasks;');
        console.log('   CREATE POLICY "Allow task creation" ON tasks FOR INSERT WITH CHECK (true);');
      }
    }
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

testTaskCreation();
