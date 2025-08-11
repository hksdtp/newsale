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
  description: 'Nhóm kinh doanh Hà Nội 5',
};

// Thông tin trưởng nhóm mới
const teamLeader = {
  name: 'Mai Tiến Đạt',
  email: 'dat.mai@company.com',
  password: '123456', // Mật khẩu mặc định
  location: 'Hà Nội',
  role: 'team_leader', // TRƯỞNG NHÓM
  department_type: 'Kinh doanh',
};

async function createTeam5WithLeader() {
  console.log('🚀 Bắt đầu tạo NHÓM 5 mới với Mai Tiến Đạt làm Trưởng nhóm...');
  console.log('================================================================');

  try {
    // 1. Kiểm tra xem Nhóm 5 có tồn tại không
    console.log('1. Kiểm tra thông tin Nhóm 5...');
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', newMember.team_id)
      .single();

    if (teamError || !team) {
      console.error('❌ Không tìm thấy Nhóm 5:', teamError);
      return;
    }

    console.log(`✅ Tìm thấy nhóm: ${team.name} (${team.location})`);

    // 2. Kiểm tra xem email đã tồn tại chưa
    console.log('\n2. Kiểm tra email đã tồn tại...');
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', newMember.email)
      .single();

    if (existingUser) {
      console.log('⚠️  Email đã tồn tại trong hệ thống:');
      console.log(`   - Tên: ${existingUser.name}`);
      console.log(`   - Email: ${existingUser.email}`);
      console.log(`   - Nhóm hiện tại: ${existingUser.team_id}`);

      // Cập nhật thông tin nếu cần
      if (existingUser.team_id !== newMember.team_id) {
        console.log('\n3. Cập nhật thông tin nhóm...');
        const { error: updateError } = await supabase
          .from('users')
          .update({
            team_id: newMember.team_id,
            location: newMember.location,
            department_type: newMember.department_type,
          })
          .eq('id', existingUser.id);

        if (updateError) {
          console.error('❌ Lỗi cập nhật:', updateError);
          return;
        }
        console.log('✅ Đã cập nhật thông tin nhóm cho user');
      }
      return;
    }

    // 3. Thêm user mới vào bảng users
    console.log('\n3. Thêm thành viên mới vào bảng users...');
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          name: newMember.name,
          email: newMember.email,
          password: newMember.password,
          password_changed: false,
          team_id: newMember.team_id,
          location: newMember.location,
          role: newMember.role,
          department_type: newMember.department_type,
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error('❌ Lỗi thêm user:', userError);
      return;
    }

    console.log('✅ Đã thêm user vào bảng users:');
    console.log(`   - ID: ${newUser.id}`);
    console.log(`   - Tên: ${newUser.name}`);
    console.log(`   - Email: ${newUser.email}`);

    // 4. Thêm vào bảng members (nếu cần thiết)
    console.log('\n4. Thêm vào bảng members...');
    const { data: newMemberRecord, error: memberError } = await supabase
      .from('members')
      .insert([
        {
          id: newUser.id,
          name: newMember.name,
          email: newMember.email,
          team_id: newMember.team_id,
          role: 'member',
          location: 'HN',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (memberError) {
      console.log(
        '⚠️  Không thể thêm vào bảng members (có thể không cần thiết):',
        memberError.message
      );
    } else {
      console.log('✅ Đã thêm vào bảng members');
    }

    // 5. Hiển thị thông tin nhóm sau khi thêm
    console.log('\n5. Kiểm tra danh sách thành viên Nhóm 5...');
    const { data: teamMembers, error: membersError } = await supabase
      .from('users')
      .select('id, name, email, role, location')
      .eq('team_id', newMember.team_id)
      .order('role', { ascending: false })
      .order('name', { ascending: true });

    if (membersError) {
      console.error('❌ Lỗi lấy danh sách thành viên:', membersError);
      return;
    }

    console.log('\n✅ Danh sách thành viên Nhóm 5:');
    teamMembers.forEach((member, index) => {
      const roleDisplay =
        member.role === 'team_leader'
          ? '👑 Trưởng nhóm'
          : member.role === 'employee'
            ? '👤 Nhân viên'
            : member.role;
      console.log(`   ${index + 1}. ${member.name} (${member.email}) - ${roleDisplay}`);
    });

    console.log('\n🎉 Hoàn thành! Mai Tiến Đạt đã được thêm vào Nhóm 5 thành công!');
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
  }
}

// Chạy script
if (require.main === module) {
  addMemberToTeam5()
    .then(() => {
      console.log('\n👋 Script hoàn thành!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Script thất bại:', error);
      process.exit(1);
    });
}

module.exports = { addMemberToTeam5 };
