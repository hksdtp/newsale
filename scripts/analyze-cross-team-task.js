#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function analyzeCrossTeamTask() {
  console.log('🔍 PHÂN TÍCH CROSS-TEAM TASK ASSIGNMENT');
  console.log('=====================================\n');
  
  try {
    // 1. Lấy thông tin Quản Thu Hà
    console.log('👤 THÔNG TIN QUẢN THU HÀ:');
    const quanThuHaResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Quản Thu Hà*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const quanThuHaData = await quanThuHaResponse.json();
    let quanThuHa = null;
    if (Array.isArray(quanThuHaData) && quanThuHaData.length > 0) {
      quanThuHa = quanThuHaData[0];
      console.log(`✅ Tên: ${quanThuHa.name}`);
      console.log(`   - ID: ${quanThuHa.id}`);
      console.log(`   - Team ID: ${quanThuHa.team_id}`);
      console.log(`   - Role: ${quanThuHa.role}`);
      console.log(`   - Location: ${quanThuHa.location}`);
      console.log(`   - Department: ${quanThuHa.department_type}`);
    } else {
      console.log('❌ Không tìm thấy Quản Thu Hà');
      return;
    }

    // 2. Lấy thông tin Phạm Thị Hương
    console.log('\n👤 THÔNG TIN PHẠM THỊ HƯƠNG:');
    const phamThiHuongResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Phạm Thị Hương*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const phamThiHuongData = await phamThiHuongResponse.json();
    let phamThiHuong = null;
    if (Array.isArray(phamThiHuongData) && phamThiHuongData.length > 0) {
      phamThiHuong = phamThiHuongData[0];
      console.log(`✅ Tên: ${phamThiHuong.name}`);
      console.log(`   - ID: ${phamThiHuong.id}`);
      console.log(`   - Team ID: ${phamThiHuong.team_id}`);
      console.log(`   - Role: ${phamThiHuong.role}`);
      console.log(`   - Location: ${phamThiHuong.location}`);
      console.log(`   - Department: ${phamThiHuong.department_type}`);
    } else {
      console.log('❌ Không tìm thấy Phạm Thị Hương');
      return;
    }

    // 3. Lấy thông tin teams
    console.log('\n🏢 THÔNG TIN TEAMS:');
    
    // Team của Quản Thu Hà
    const quanTeamResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=eq.${quanThuHa.team_id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const quanTeamData = await quanTeamResponse.json();
    
    // Team của Phạm Thị Hương
    const phamTeamResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=eq.${phamThiHuong.team_id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const phamTeamData = await phamTeamResponse.json();
    
    if (Array.isArray(quanTeamData) && quanTeamData.length > 0) {
      console.log(`📍 Team của Quản Thu Hà: ${quanTeamData[0].name}`);
      console.log(`   - Team ID: ${quanTeamData[0].id}`);
      console.log(`   - Location: ${quanTeamData[0].location}`);
    }
    
    if (Array.isArray(phamTeamData) && phamTeamData.length > 0) {
      console.log(`📍 Team của Phạm Thị Hương: ${phamTeamData[0].name}`);
      console.log(`   - Team ID: ${phamTeamData[0].id}`);
      console.log(`   - Location: ${phamTeamData[0].location}`);
    }

    // 4. Phân tích cross-team assignment
    console.log('\n🔍 PHÂN TÍCH CROSS-TEAM ASSIGNMENT:');
    const isSameTeam = quanThuHa.team_id === phamThiHuong.team_id;
    const isSameLocation = quanThuHa.location === phamThiHuong.location;
    
    console.log(`   - Cùng team: ${isSameTeam ? '✅ CÓ' : '❌ KHÔNG'}`);
    console.log(`   - Cùng location: ${isSameLocation ? '✅ CÓ' : '❌ KHÔNG'}`);
    console.log(`   - Quản Thu Hà role: ${quanThuHa.role}`);
    console.log(`   - Phạm Thị Hương role: ${phamThiHuong.role}`);

    // 5. Tìm task cụ thể
    console.log('\n📋 THÔNG TIN TASK "KH- Chị Linh - Quảng An":');
    const taskResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&name=ilike.*Quảng An*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const taskData = await taskResponse.json();
    if (Array.isArray(taskData) && taskData.length > 0) {
      const task = taskData[0];
      console.log(`✅ Task: ${task.name}`);
      console.log(`   - ID: ${task.id}`);
      console.log(`   - Created by ID: ${task.created_by_id}`);
      console.log(`   - Assigned to ID: ${task.assigned_to_id}`);
      console.log(`   - Share scope: ${task.share_scope}`);
      console.log(`   - Department: ${task.department}`);
      console.log(`   - Status: ${task.status}`);
      console.log(`   - Created at: ${task.created_at}`);
      
      // Verify IDs match
      console.log('\n🔍 VERIFICATION:');
      console.log(`   - Creator ID matches Quản Thu Hà: ${task.created_by_id === quanThuHa.id ? '✅' : '❌'}`);
      console.log(`   - Assignee ID matches Phạm Thị Hương: ${task.assigned_to_id === phamThiHuong.id ? '✅' : '❌'}`);
    }

    // 6. Phân tích business logic
    console.log('\n🚨 PHÂN TÍCH BUSINESS LOGIC:');
    
    if (!isSameTeam) {
      console.log('⚠️  PHÁT HIỆN VẤN ĐỀ:');
      console.log('   - Đây là CROSS-TEAM TASK ASSIGNMENT');
      console.log('   - Quản Thu Hà tạo task cho người ở team khác');
      console.log('   - Vi phạm nguyên tắc team isolation');
      
      console.log('\n🔒 SECURITY IMPLICATIONS:');
      console.log('   - Team members có thể assign tasks cho teams khác');
      console.log('   - Có thể bypass team permissions');
      console.log('   - Cần review task creation permissions');
      
      console.log('\n💡 KHUYẾN NGHỊ:');
      console.log('   1. Kiểm tra task creation permissions');
      console.log('   2. Implement cross-team assignment rules');
      console.log('   3. Add validation cho assignee selection');
      console.log('   4. Review existing cross-team tasks');
    } else {
      console.log('✅ BUSINESS LOGIC HỢP LỆ:');
      console.log('   - Cùng team, assignment hợp lệ');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

analyzeCrossTeamTask();
