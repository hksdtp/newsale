#!/usr/bin/env node

/**
 * Script tự động tạo NHÓM 5 và đồng bộ dữ liệu
 * Sẽ thử kết nối với database và tạo nhóm tự động
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

console.log('🚀 Tự động tạo NHÓM 5 và đồng bộ dữ liệu');
console.log('==========================================');

// Thử các cấu hình Supabase khác nhau
const configs = [
  {
    name: 'Local Supabase',
    url: 'http://localhost:54321',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
  },
  {
    name: 'Environment Variables',
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
  },
];

async function testConnection(config) {
  if (!config.url || !config.key) {
    console.log(`❌ ${config.name}: Thiếu URL hoặc key`);
    return null;
  }

  try {
    console.log(`🔍 Thử kết nối ${config.name}...`);
    const supabase = createClient(config.url, config.key);

    // Test connection bằng cách query một bảng đơn giản
    const { data, error } = await supabase.from('teams').select('count').limit(1);

    if (error) {
      console.log(`❌ ${config.name}: ${error.message}`);
      return null;
    }

    console.log(`✅ ${config.name}: Kết nối thành công!`);
    return supabase;
  } catch (error) {
    console.log(`❌ ${config.name}: ${error.message}`);
    return null;
  }
}

async function createTeam5(supabase) {
  try {
    console.log('\n📋 Bắt đầu tạo NHÓM 5...');

    // 1. Tạo team
    console.log('1. Tạo team...');
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .upsert(
        [
          {
            name: 'NHÓM 5 - Mai Tiến Đạt',
            description: 'Nhóm kinh doanh Hà Nội 5',
          },
        ],
        { onConflict: 'name' }
      )
      .select()
      .single();

    if (teamError) {
      console.error('❌ Lỗi tạo team:', teamError);
      return false;
    }

    console.log(`✅ Team created: ${team.name} (ID: ${team.id})`);

    // 2. Tạo user
    console.log('2. Tạo user Mai Tiến Đạt...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert(
        [
          {
            name: 'Mai Tiến Đạt',
            email: 'dat.mai@company.com',
            password: '123456',
            password_changed: false,
            team_id: team.id,
            location: 'Hà Nội',
            role: 'team_leader',
            department_type: 'Kinh doanh',
          },
        ],
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (userError) {
      console.error('❌ Lỗi tạo user:', userError);
      return false;
    }

    console.log(`✅ User created: ${user.name} (${user.role})`);

    // 3. Kiểm tra kết quả
    console.log('\n3. Kiểm tra kết quả...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select(
        `
        id,
        name,
        location,
        description,
        users(id, name, role)
      `
      )
      .order('name');

    if (!teamsError && teams) {
      console.log('\n📊 Danh sách teams tại Hà Nội:');
      teams.forEach((team, index) => {
        const memberCount = team.users?.length || 0;
        const leader = team.users?.find(u => u.role === 'team_leader');
        console.log(`   ${index + 1}. ${team.name}`);
        console.log(`      - Trưởng nhóm: ${leader?.name || 'Chưa có'}`);
        console.log(`      - Số thành viên: ${memberCount}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
    return false;
  }
}

async function main() {
  let supabase = null;

  // Thử kết nối với các config khác nhau
  for (const config of configs) {
    supabase = await testConnection(config);
    if (supabase) break;
  }

  if (!supabase) {
    console.log('\n❌ Không thể kết nối với database!');
    console.log('\n🔧 Các cách khắc phục:');
    console.log('');
    console.log('📌 Cách 1: Khởi động Supabase local');
    console.log('   - Khởi động Docker Desktop');
    console.log('   - Chạy: npm run db:start');
    console.log('   - Chạy lại script này');
    console.log('');
    console.log('📌 Cách 2: Sử dụng Supabase cloud');
    console.log('   - Tạo file .env.local với:');
    console.log('     VITE_SUPABASE_URL=your-supabase-url');
    console.log('     VITE_SUPABASE_ANON_KEY=your-anon-key');
    console.log('   - Chạy lại script này');
    console.log('');
    console.log('📌 Cách 3: Chạy SQL thủ công');
    console.log('   - Mở Supabase Dashboard');
    console.log('   - Vào SQL Editor');
    console.log('   - Chạy file: scripts/create-team5-and-sync.sql');

    // Tạo file hướng dẫn
    const instructions = `
# Hướng dẫn tạo NHÓM 5 thủ công

## Cách 1: Supabase Dashboard (Khuyến nghị)
1. Truy cập Supabase Dashboard của dự án
2. Vào SQL Editor
3. Copy và paste nội dung file: scripts/create-team5-and-sync.sql
4. Chạy script
5. Refresh trang web để thấy NHÓM 5

## Cách 2: Khởi động database local
1. Khởi động Docker Desktop
2. Chạy: npm run db:start
3. Chạy: node scripts/auto-create-team5.js

## Thông tin đăng nhập Mai Tiến Đạt
- Email: dat.mai@company.com
- Mật khẩu: 123456
- Vai trò: Trưởng nhóm NHÓM 5

## Chức năng quản lý nhân viên cho Khổng Đức Mạnh
- Đăng nhập với tài khoản Khổng Đức Mạnh
- Vào menu "Nhân Viên"
- Click tab "Quản lý" để thêm/xóa nhân viên và nhóm
`;

    fs.writeFileSync(path.join(__dirname, 'HUONG_DAN_TAO_NHOM_5.md'), instructions.trim());

    console.log('\n💾 Đã tạo file hướng dẫn: scripts/HUONG_DAN_TAO_NHOM_5.md');
    process.exit(1);
  }

  // Tạo NHÓM 5
  const success = await createTeam5(supabase);

  if (success) {
    console.log('\n🎉 HOÀN THÀNH!');
    console.log('================');
    console.log('✅ NHÓM 5 đã được tạo thành công');
    console.log('✅ Mai Tiến Đạt đã được thêm làm trưởng nhóm');
    console.log('');
    console.log('📱 Bây giờ bạn có thể:');
    console.log('   - Refresh trang web để thấy NHÓM 5');
    console.log('   - Đăng nhập với email: dat.mai@company.com');
    console.log('   - Mật khẩu: 123456');
    console.log('   - Sử dụng chức năng quản lý nhân viên của Khổng Đức Mạnh');
    console.log('');
    console.log('👑 Chức năng quản lý cho Khổng Đức Mạnh:');
    console.log('   - Vào menu "Nhân Viên"');
    console.log('   - Click tab "Quản lý"');
    console.log('   - Thêm/xóa nhân viên và nhóm');
  } else {
    console.log('\n❌ Có lỗi xảy ra khi tạo NHÓM 5');
    console.log('Vui lòng thử chạy SQL thủ công: scripts/create-team5-and-sync.sql');
  }
}

// Chạy script
main().catch(console.error);
