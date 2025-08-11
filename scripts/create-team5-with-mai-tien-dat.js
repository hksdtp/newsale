#!/usr/bin/env node

/**
 * Script để tạo NHÓM 5 mới và thêm Mai Tiến Đạt làm Trưởng nhóm
 * Tác giả: Auto-generated script
 * Ngày tạo: 2025-01-11
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Thông tin nhóm mới
const newTeam = {
  name: 'NHÓM 5 - Mai Tiến Đạt',
  location: 'HN',
  description: 'Nhóm kinh doanh Hà Nội 5'
};

// Thông tin trưởng nhóm mới
const teamLeader = {
  name: 'Mai Tiến Đạt',
  email: 'dat.mai@company.com',
  password: '123456', // Mật khẩu mặc định
  location: 'Hà Nội',
  role: 'team_leader', // TRƯỞNG NHÓM
  department_type: 'Kinh doanh'
};

async function createTeam5WithLeader() {
  console.log('🚀 Tạo NHÓM 5 mới với Mai Tiến Đạt làm Trưởng nhóm');
  console.log('=======================================================');
  
  try {
    // 1. Kiểm tra xem NHÓM 5 đã tồn tại chưa
    console.log('1. Kiểm tra NHÓM 5 hiện có...');
    const { data: existingTeams, error: teamCheckError } = await supabase
      .from('teams')
      .select('*')
      .ilike('name', '%NHÓM 5%');

    if (teamCheckError) {
      console.error('❌ Lỗi kiểm tra nhóm:', teamCheckError);
      return;
    }

    if (existingTeams && existingTeams.length > 0) {
      console.log(`⚠️  Đã có ${existingTeams.length} nhóm với tên chứa "NHÓM 5":`);
      existingTeams.forEach(team => {
        console.log(`   - ${team.name} (${team.location})`);
      });
    } else {
      console.log('✅ Chưa có NHÓM 5 nào');
    }

    // 2. Tạo NHÓM 5 mới
    console.log('\n2. Tạo NHÓM 5 mới...');
    const { data: createdTeam, error: teamError } = await supabase
      .from('teams')
      .upsert([newTeam], { onConflict: 'name' })
      .select()
      .single();

    if (teamError) {
      console.error('❌ Lỗi tạo nhóm:', teamError);
      return;
    }

    console.log(`✅ Nhóm đã được tạo/cập nhật: ${createdTeam.name}`);
    console.log(`   - ID: ${createdTeam.id}`);
    console.log(`   - Khu vực: ${createdTeam.location}`);
    console.log(`   - Mô tả: ${createdTeam.description}`);

    // 3. Kiểm tra email Mai Tiến Đạt
    console.log('\n3. Kiểm tra email Mai Tiến Đạt...');
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('*')
      .eq('email', teamLeader.email)
      .single();

    if (userCheckError && userCheckError.code !== 'PGRST116') {
      console.error('❌ Lỗi kiểm tra user:', userCheckError);
      return;
    }

    if (existingUser) {
      console.log('⚠️  Email đã tồn tại:');
      console.log(`   - Tên: ${existingUser.name}`);
      console.log(`   - Vai trò hiện tại: ${existingUser.role}`);
      console.log(`   - Nhóm hiện tại: ${existingUser.team_id}`);
      
      // Cập nhật thành trưởng nhóm
      console.log('\n4. Cập nhật thành trưởng NHÓM 5...');
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          team_id: createdTeam.id,
          location: teamLeader.location,
          role: teamLeader.role,
          department_type: teamLeader.department_type
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Lỗi cập nhật user:', updateError);
        return;
      }

      console.log('✅ Đã cập nhật Mai Tiến Đạt thành trưởng NHÓM 5');
    } else {
      // Tạo user mới
      console.log('\n4. Tạo Mai Tiến Đạt làm trưởng NHÓM 5...');
      const { data: newUser, error: createUserError } = await supabase
        .from('users')
        .insert([{
          name: teamLeader.name,
          email: teamLeader.email,
          password: teamLeader.password,
          password_changed: false,
          team_id: createdTeam.id,
          location: teamLeader.location,
          role: teamLeader.role,
          department_type: teamLeader.department_type
        }])
        .select()
        .single();

      if (createUserError) {
        console.error('❌ Lỗi tạo user:', createUserError);
        return;
      }

      console.log('✅ Đã tạo Mai Tiến Đạt làm trưởng NHÓM 5');
      console.log(`   - ID: ${newUser.id}`);
      console.log(`   - Email: ${newUser.email}`);
      console.log(`   - Vai trò: ${newUser.role}`);
    }

    // 5. Hiển thị kết quả cuối cùng
    console.log('\n5. Kiểm tra kết quả...');
    const { data: finalResult, error: finalError } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        location,
        department_type,
        team:teams(id, name, location, description)
      `)
      .eq('email', teamLeader.email)
      .single();

    if (finalError) {
      console.error('❌ Lỗi kiểm tra kết quả:', finalError);
      return;
    }

    console.log('\n🎉 HOÀN THÀNH!');
    console.log('================');
    console.log(`👤 Trưởng nhóm: ${finalResult.name}`);
    console.log(`📧 Email: ${finalResult.email}`);
    console.log(`👑 Vai trò: ${finalResult.role === 'team_leader' ? 'Trưởng nhóm' : finalResult.role}`);
    console.log(`📍 Khu vực: ${finalResult.location}`);
    console.log(`🏢 Phòng ban: ${finalResult.department_type}`);
    console.log(`🏷️  Nhóm: ${finalResult.team?.name || 'Không có'}`);
    console.log(`📝 Mô tả nhóm: ${finalResult.team?.description || 'Không có'}`);

    // 6. Hiển thị tổng quan các nhóm tại Hà Nội
    console.log('\n📊 Tổng quan các nhóm tại Hà Nội:');
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        location,
        description,
        users(id, name, role)
      `)
      .eq('location', 'HN')
      .order('name');

    if (!teamsError && allTeams) {
      allTeams.forEach((team, index) => {
        const memberCount = team.users?.length || 0;
        const leader = team.users?.find(u => u.role === 'team_leader');
        console.log(`   ${index + 1}. ${team.name}`);
        console.log(`      - Trưởng nhóm: ${leader?.name || 'Chưa có'}`);
        console.log(`      - Số thành viên: ${memberCount}`);
      });
    }

  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  createTeam5WithLeader()
    .then(() => {
      console.log('\n👋 Script hoàn thành!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script thất bại:', error);
      process.exit(1);
    });
}

module.exports = { createTeam5WithLeader };
