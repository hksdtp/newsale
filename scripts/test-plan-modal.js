#!/usr/bin/env node

/**
 * Script để test chức năng modal chi tiết kế hoạch
 * Kiểm tra các kế hoạch có sẵn trong database
 */

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testPlanModal() {
  console.log('🧪 Testing Plan Detail Modal functionality...\n');
  
  try {
    // 1. Lấy danh sách scheduled tasks
    console.log('📋 Fetching scheduled tasks...');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/scheduled_tasks?select=*&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const tasks = await response.json();
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      console.log('❌ Không có scheduled tasks nào trong database');
      console.log('💡 Hãy tạo một số kế hoạch trong ứng dụng để test');
      return;
    }
    
    console.log(`✅ Tìm thấy ${tasks.length} scheduled tasks:`);
    
    // 2. Hiển thị thông tin các tasks
    tasks.forEach((task, index) => {
      console.log(`\n${index + 1}. ${task.name || 'Unnamed Task'}`);
      console.log(`   - ID: ${task.id}`);
      console.log(`   - Description: ${task.description || 'No description'}`);
      console.log(`   - Scheduled Date: ${task.scheduled_date || 'No date'}`);
      console.log(`   - Scheduled Time: ${task.scheduled_time || 'No time'}`);
      console.log(`   - Priority: ${task.priority || 'normal'}`);
      console.log(`   - Created By: ${task.created_by_name || 'Unknown'}`);
      console.log(`   - Source: ${task.source || 'unknown'}`);
    });
    
    // 3. Test tạo một scheduled task mới để test modal
    console.log('\n🆕 Creating a test scheduled task...');
    
    const testTask = {
      name: 'Test Plan Modal - ' + new Date().toLocaleTimeString(),
      description: 'Đây là kế hoạch test để kiểm tra modal chi tiết',
      scheduled_date: new Date().toISOString().split('T')[0], // Hôm nay
      scheduled_time: '14:30',
      priority: 'high',
      source: 'manual',
      created_by_name: 'Test User'
    };
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/scheduled_tasks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testTask)
    });
    
    if (createResponse.ok) {
      const newTask = await createResponse.json();
      console.log('✅ Test task created successfully!');
      console.log(`   - ID: ${newTask[0]?.id}`);
      console.log(`   - Name: ${newTask[0]?.name}`);
      
      // 4. Test cập nhật task
      console.log('\n🔄 Testing task update...');
      const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/scheduled_tasks?id=eq.${newTask[0].id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Mô tả đã được cập nhật từ modal - ' + new Date().toLocaleTimeString()
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Task update successful!');
      } else {
        const updateError = await updateResponse.json();
        console.log('❌ Task update failed:', updateError);
      }
      
    } else {
      const createError = await createResponse.json();
      console.log('❌ Failed to create test task:', createError);
    }
    
    // 5. Hướng dẫn test manual
    console.log('\n📝 MANUAL TESTING CHECKLIST:');
    console.log('1. ✅ Mở ứng dụng và vào tab "Kế Hoạch"');
    console.log('2. ✅ Click vào một item kế hoạch trong danh sách');
    console.log('3. ✅ Kiểm tra modal PlanDetailModal hiển thị');
    console.log('4. ✅ Verify thông tin hiển thị đúng (tên, mô tả, thời gian, ưu tiên)');
    console.log('5. ✅ Click nút "Chỉnh sửa" và test edit mode');
    console.log('6. ✅ Thay đổi thông tin và click "Lưu thay đổi"');
    console.log('7. ✅ Kiểm tra loading state khi lưu');
    console.log('8. ✅ Test responsive trên mobile (resize browser)');
    console.log('9. ✅ Test nút "Xóa" với confirmation');
    console.log('10. ✅ Kiểm tra console không có lỗi JavaScript');
    
    console.log('\n🎯 EXPECTED BEHAVIOR:');
    console.log('- Modal mở khi click vào plan item');
    console.log('- Dropdown "Xem chi tiết" cũng mở modal');
    console.log('- Edit mode hoạt động với validation');
    console.log('- Loading states hiển thị khi save/delete');
    console.log('- Responsive design trên mobile');
    console.log('- Không có lỗi console');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testPlanModal();
