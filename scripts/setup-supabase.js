#!/usr/bin/env node

/**
 * Script to help setup Supabase for the project
 * Run with: node scripts/setup-supabase.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Supabase Setup Helper\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ File .env.local không tồn tại!');
  console.log('📝 Tạo file .env.local với nội dung sau:\n');
  console.log('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.log('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here\n');
  process.exit(1);
}

// Read .env.local
const envContent = fs.readFileSync(envPath, 'utf8');
const hasUrl = envContent.includes('VITE_SUPABASE_URL=https://');
const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY=eyJ') && !envContent.includes('your_supabase_anon_key_here');

console.log('📋 Kiểm tra cấu hình:');
console.log(`✅ File .env.local: ${envExists ? 'Có' : 'Không'}`);
console.log(`${hasUrl ? '✅' : '❌'} VITE_SUPABASE_URL: ${hasUrl ? 'Đã cấu hình' : 'Chưa cấu hình'}`);
console.log(`${hasKey ? '✅' : '❌'} VITE_SUPABASE_ANON_KEY: ${hasKey ? 'Đã cấu hình' : 'Chưa cấu hình'}\n`);

if (!hasUrl || !hasKey) {
  console.log('⚠️  Vui lòng cập nhật file .env.local với thông tin Supabase của bạn\n');
  console.log('📖 Hướng dẫn chi tiết trong file SUPABASE_SETUP.md\n');
  console.log('🔗 Các bước cần làm:');
  console.log('1. Tạo project tại https://supabase.com');
  console.log('2. Copy URL và anon key từ Settings > API');
  console.log('3. Cập nhật file .env.local');
  console.log('4. Chạy SQL script trong database/schema.sql');
  console.log('5. Restart development server\n');
  process.exit(1);
}

console.log('🎉 Cấu hình Supabase đã sẵn sàng!');
console.log('📝 Bước tiếp theo:');
console.log('1. Chạy SQL script: Copy nội dung database/schema.sql vào Supabase SQL Editor');
console.log('2. Restart server: npm run dev');
console.log('3. Test đăng nhập với: admin@company.com / 123456\n');

// Check if schema.sql exists
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ File database/schema.sql đã sẵn sàng để import');
} else {
  console.log('❌ File database/schema.sql không tìm thấy');
}

console.log('\n🔧 Troubleshooting:');
console.log('- Nếu gặp lỗi kết nối: Kiểm tra URL và API key');
console.log('- Nếu gặp lỗi database: Đảm bảo đã chạy SQL script');
console.log('- Nếu gặp lỗi authentication: Kiểm tra RLS policies\n');

console.log('📚 Xem thêm: SUPABASE_SETUP.md');
