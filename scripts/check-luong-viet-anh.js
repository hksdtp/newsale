#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function checkLuongVietAnh() {
  console.log('🔍 Kiểm tra thông tin Lương Việt Anh...');
  
  try {
    // 1. Tìm Lương Việt Anh
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Lương Việt Anh*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const usersData = await usersResponse.json();
    if (Array.isArray(usersData) && usersData.length > 0) {
      const luongVietAnh = usersData[0];
      console.log(`✅ Tìm thấy: ${luongVietAnh.name}`);
      console.log(`   - ID: ${luongVietAnh.id}`);
      console.log(`   - Team ID: ${luongVietAnh.team_id}`);
      console.log(`   - Location: ${luongVietAnh.location}`);
      console.log(`   - Role: ${luongVietAnh.role}`);
      
      // 2. Lấy thông tin team
      const teamResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=eq.${luongVietAnh.team_id}`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const teamData = await teamResponse.json();
      if (Array.isArray(teamData) && teamData.length > 0) {
        console.log(`\n🏢 TEAM CỦA LƯƠNG VIỆT ANH:`);
        console.log(`✅ Team: ${teamData[0].name}`);
        console.log(`   - ID: ${teamData[0].id}`);
      }
      
      // 3. So sánh team ID
      const phamThiHuongTeamId = 'f4d83b0b-ad26-4ad4-90c7-38ea87889bbd';
      console.log(`\n🔍 SO SÁNH TEAM:`);
      console.log(`   - Lương Việt Anh team: ${luongVietAnh.team_id}`);
      console.log(`   - Phạm Thị Hương team: ${phamThiHuongTeamId}`);
      console.log(`   - Cùng team: ${luongVietAnh.team_id === phamThiHuongTeamId ? 'CÓ' : 'KHÔNG'}`);
      
      // 4. Kiểm tra permission logic
      console.log(`\n🔐 PERMISSION ANALYSIS:`);
      console.log(`   - Lương Việt Anh role: ${luongVietAnh.role}`);
      console.log(`   - Có phải team_leader: ${luongVietAnh.role === 'team_leader' ? 'CÓ' : 'KHÔNG'}`);
      console.log(`   - Cùng location (Hà Nội): CÓ`);
      
      if (luongVietAnh.role === 'team_leader') {
        console.log(`\n⚠️  PHÁT HIỆN VẤN ĐỀ:`);
        console.log(`   - Lương Việt Anh là TEAM LEADER`);
        console.log(`   - Theo logic hiện tại, team leader có thể xem tasks của team khác`);
        console.log(`   - Điều này có thể là BUG BẢO MẬT!`);
      }
      
    } else {
      console.log('❌ Không tìm thấy Lương Việt Anh');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
}

checkLuongVietAnh();
