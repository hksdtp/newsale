#!/usr/bin/env node

/**
 * Script đơn giản để thêm Mai Tiến Đạt vào Nhóm 5
 * Sử dụng Supabase cloud hoặc production database
 */

console.log('🚀 Tạo NHÓM 5 mới với Mai Tiến Đạt làm Trưởng nhóm - Hà Nội');
console.log('================================================================');

// Thông tin nhóm mới
const teamInfo = {
  name: 'NHÓM 5 - Mai Tiến Đạt',
  location: 'HN',
  description: 'Nhóm kinh doanh Hà Nội 5',
};

// Thông tin trưởng nhóm mới
const leaderInfo = {
  name: 'Mai Tiến Đạt',
  email: 'dat.mai@company.com',
  password: '123456',
  team: 'NHÓM 5 - Mai Tiến Đạt',
  location: 'Hà Nội',
  role: 'team_leader', // TRƯỞNG NHÓM
  department_type: 'Kinh doanh',
};

console.log('📋 Thông tin nhóm mới:');
console.log(`   - Tên nhóm: ${teamInfo.name}`);
console.log(`   - Khu vực: ${teamInfo.location} (Hà Nội)`);
console.log(`   - Mô tả: ${teamInfo.description}`);

console.log('\n👑 Thông tin trưởng nhóm:');
console.log(`   - Tên: ${leaderInfo.name}`);
console.log(`   - Email: ${leaderInfo.email}`);
console.log(`   - Vai trò: ${leaderInfo.role} (Trưởng nhóm)`);
console.log(`   - Phòng ban: ${leaderInfo.department_type}`);

console.log('\n📝 Các bước thực hiện:');
console.log('1. ✅ Tạo thông tin nhóm và trưởng nhóm');
console.log('2. ⏳ Cần kết nối database để tạo nhóm mới');

console.log('\n🔧 Hướng dẫn thực hiện:');
console.log('Để hoàn tất việc tạo nhóm mới, bạn có thể:');
console.log('');
console.log('📌 Cách 1: Sử dụng Supabase Dashboard (Khuyến nghị)');
console.log('   - Truy cập Supabase Dashboard');
console.log('   - Vào SQL Editor');
console.log('   - Chạy file: scripts/add-mai-tien-dat-team5.sql');
console.log('');
console.log('📌 Cách 2: Khởi động Docker và chạy local database');
console.log('   - Khởi động Docker Desktop');
console.log('   - Chạy: npm run db:start');
console.log('   - Chạy: node scripts/create-team5-with-mai-tien-dat.js');
console.log('');
console.log('📌 Cách 3: Thêm trực tiếp qua ứng dụng web');
console.log('   - Mở ứng dụng tại: http://localhost:3000');
console.log('   - Đăng nhập với quyền admin');
console.log('   - Vào phần quản lý nhân sự');
console.log('   - Tạo nhóm mới và thêm trưởng nhóm');

console.log('\n📊 Cơ cấu tổ chức hiện tại tại Hà Nội:');
console.log('   - NHÓM 1 - Lương Việt Anh (Trưởng nhóm)');
console.log('   - NHÓM 2 - Nguyễn Thị Thảo (Trưởng nhóm)');
console.log('   - NHÓM 3 - Trịnh Thị Bốn (Trưởng nhóm)');
console.log('   - NHÓM 4 - Phạm Thị Hương (Trưởng nhóm)');

console.log('\n🎯 Kết quả mong đợi:');
console.log('Sau khi tạo thành công, sẽ có thêm:');
console.log('   - NHÓM 5 - Mai Tiến Đạt (Trưởng nhóm) ← MỚI');

console.log(
  '\n✨ Script hoàn thành! Vui lòng chọn một trong các cách trên để thêm thành viên vào database.'
);

// Tạo file cấu hình cho việc import
const configData = {
  action: 'create_team_with_leader',
  timestamp: new Date().toISOString(),
  team: teamInfo,
  leader: leaderInfo,
  instructions: [
    'Chạy SQL script: scripts/add-mai-tien-dat-team5.sql',
    'Hoặc khởi động Docker và chạy: node scripts/create-team5-with-mai-tien-dat.js',
    'Hoặc thêm trực tiếp qua web interface',
  ],
};

// Ghi file cấu hình
const fs = require('fs');
const path = require('path');

try {
  fs.writeFileSync(
    path.join(__dirname, 'add-member-config.json'),
    JSON.stringify(configData, null, 2)
  );
  console.log('\n💾 Đã lưu cấu hình vào: scripts/add-member-config.json');
} catch (error) {
  console.log('\n⚠️  Không thể lưu file cấu hình:', error.message);
}
