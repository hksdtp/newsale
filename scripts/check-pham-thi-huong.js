#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function checkPhamThiHuong() {
  console.log('🔍 Kiểm tra thông tin Phạm Thị Hương...');
  
  try {
    // 1. Tìm Phạm Thị Hương trong users
    console.log('\n👤 TÌM PHẠM THỊ HƯƠNG:');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Phạm Thị Hương*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const usersData = await usersResponse.json();
    if (Array.isArray(usersData) && usersData.length > 0) {
      const phamThiHuong = usersData[0];
      console.log(`✅ Tìm thấy: ${phamThiHuong.name}`);
      console.log(`   - ID: ${phamThiHuong.id}`);
      console.log(`   - Team ID: ${phamThiHuong.team_id}`);
      console.log(`   - Location: ${phamThiHuong.location}`);
      console.log(`   - Role: ${phamThiHuong.role}`);
      
      // 2. Tìm tasks của Phạm Thị Hương
      console.log('\n📋 TASKS CỦA PHẠM THỊ HƯƠNG:');
      const tasksResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&or=(created_by_id.eq.${phamThiHuong.id},assigned_to_id.eq.${phamThiHuong.id})`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const tasksData = await tasksResponse.json();
      if (Array.isArray(tasksData)) {
        console.log(`✅ Tìm thấy ${tasksData.length} tasks:`);
        tasksData.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.name}`);
          console.log(`      - Status: ${task.status}`);
          console.log(`      - Created by: ${task.created_by_id === phamThiHuong.id ? 'Phạm Thị Hương' : 'Khác'}`);
          console.log(`      - Assigned to: ${task.assigned_to_id === phamThiHuong.id ? 'Phạm Thị Hương' : 'Khác'}`);
        });
      } else {
        console.log('❌ Lỗi khi lấy tasks:', tasksData);
      }
      
      // 3. Kiểm tra team của Phạm Thị Hương
      if (phamThiHuong.team_id) {
        console.log('\n🏢 TEAM CỦA PHẠM THỊ HƯƠNG:');
        const teamResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=eq.${phamThiHuong.team_id}`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        const teamData = await teamResponse.json();
        if (Array.isArray(teamData) && teamData.length > 0) {
          const team = teamData[0];
          console.log(`✅ Team: ${team.name}`);
          console.log(`   - ID: ${team.id}`);
        } else {
          console.log('❌ Không tìm thấy team hoặc lỗi:', teamData);
        }
      }
      
    } else {
      console.log('❌ Không tìm thấy Phạm Thị Hương:', usersData);
      
      // Tìm tất cả users có tên tương tự
      console.log('\n🔍 TÌM TẤT CẢ USERS CÓ TÊN TƯƠNG TỰ:');
      const allUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Hương*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const allUsersData = await allUsersResponse.json();
      if (Array.isArray(allUsersData)) {
        allUsersData.forEach(user => {
          console.log(`   - ${user.name} (ID: ${user.id})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

checkPhamThiHuong();
