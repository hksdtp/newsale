#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function debugTaskMapping() {
  console.log('🔍 Debug task mapping issue...');
  
  try {
    // 1. Tìm task có tên "KH- Chị Linh - Quảng An"
    console.log('\n📋 TÌM TASK CỤ THỂ:');
    const tasksResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&name=ilike.*Chị Linh*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const tasksData = await tasksResponse.json();
    if (Array.isArray(tasksData) && tasksData.length > 0) {
      const task = tasksData[0];
      console.log(`✅ Tìm thấy task: ${task.name}`);
      console.log(`   - ID: ${task.id}`);
      console.log(`   - Created by ID: ${task.created_by_id}`);
      console.log(`   - Assigned to ID: ${task.assigned_to_id}`);
      console.log(`   - Status: ${task.status}`);
      console.log(`   - Department: ${task.department}`);
      console.log(`   - Share scope: ${task.share_scope}`);
      
      // 2. Lấy thông tin người tạo
      if (task.created_by_id) {
        console.log('\n👤 THÔNG TIN NGƯỜI TẠO:');
        const creatorResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=eq.${task.created_by_id}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        const creatorData = await creatorResponse.json();
        if (Array.isArray(creatorData) && creatorData.length > 0) {
          const creator = creatorData[0];
          console.log(`✅ Người tạo: ${creator.name}`);
          console.log(`   - ID: ${creator.id}`);
          console.log(`   - Team ID: ${creator.team_id}`);
          console.log(`   - Role: ${creator.role}`);
          console.log(`   - Location: ${creator.location}`);
        }
      }
      
      // 3. Lấy thông tin người được giao
      if (task.assigned_to_id) {
        console.log('\n👥 THÔNG TIN NGƯỜI ĐƯỢC GIAO:');
        const assigneeResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=eq.${task.assigned_to_id}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        const assigneeData = await assigneeResponse.json();
        if (Array.isArray(assigneeData) && assigneeData.length > 0) {
          const assignee = assigneeData[0];
          console.log(`✅ Người được giao: ${assignee.name}`);
          console.log(`   - ID: ${assignee.id}`);
          console.log(`   - Team ID: ${assignee.team_id}`);
          console.log(`   - Role: ${assignee.role}`);
          console.log(`   - Location: ${assignee.location}`);
        }
      }
      
      // 4. Kiểm tra team assignments
      console.log('\n🏢 KIỂM TRA TEAM ASSIGNMENTS:');
      
      // Lấy thông tin Phạm Thị Hương
      const phamThiHuongResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Phạm Thị Hương*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const phamThiHuongData = await phamThiHuongResponse.json();
      if (Array.isArray(phamThiHuongData) && phamThiHuongData.length > 0) {
        const phamThiHuong = phamThiHuongData[0];
        console.log(`📍 Phạm Thị Hương team: ${phamThiHuong.team_id}`);
      }
      
      // Lấy thông tin Quản Thu Hà
      const quanThuHaResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Quản Thu Hà*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const quanThuHaData = await quanThuHaResponse.json();
      if (Array.isArray(quanThuHaData) && quanThuHaData.length > 0) {
        const quanThuHa = quanThuHaData[0];
        console.log(`📍 Quản Thu Hà team: ${quanThuHa.team_id}`);
      }
      
      // Lấy thông tin Lương Việt Anh
      const luongVietAnhResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Lương Việt Anh*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const luongVietAnhData = await luongVietAnhResponse.json();
      if (Array.isArray(luongVietAnhData) && luongVietAnhData.length > 0) {
        const luongVietAnh = luongVietAnhData[0];
        console.log(`📍 Lương Việt Anh team: ${luongVietAnh.team_id}`);
      }
      
    } else {
      console.log('❌ Không tìm thấy task');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

debugTaskMapping();
