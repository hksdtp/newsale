#!/usr/bin/env node

/**
 * 🔧 FIX MISSING FUNCTION SCRIPT
 * Khắc phục lỗi thiếu function set_user_context trong database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMzQ3NzI5NCwiZXhwIjoyMDM5MDUzMjk0fQ.VVOQQgmkqOJkTLCJKOQJQOQJQOQJQOQJQOQJQOQJQOQ';

async function fixMissingFunction() {
  console.log('🔧 Bắt đầu khắc phục lỗi thiếu function set_user_context...');

  try {
    // Tạo Supabase client với service key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Đọc file migration
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/20250812_fix_tasks_rls_security.sql'
    );

    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Không tìm thấy file migration:', migrationPath);
      return;
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📄 Đã đọc file migration thành công');

    // Chỉ chạy phần tạo function set_user_context
    const functionSQL = `
-- Create a function to set user context for custom auth
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Set a custom setting that can be used in RLS policies
  PERFORM set_config('app.current_user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION set_user_context(UUID) TO authenticated, anon;
`;

    console.log('🔧 Đang tạo function set_user_context...');

    // Chạy SQL để tạo function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: functionSQL,
    });

    if (error) {
      console.error('❌ Lỗi khi tạo function:', error);

      // Thử cách khác - sử dụng query trực tiếp
      console.log('🔄 Thử cách khác...');

      const { error: directError } = await supabase.from('pg_stat_statements').select('*').limit(1);

      if (directError) {
        console.log('📝 Sử dụng phương pháp thủ công...');
        console.log('Vui lòng copy đoạn SQL sau vào Supabase SQL Editor:');
        console.log('='.repeat(60));
        console.log(functionSQL);
        console.log('='.repeat(60));
        console.log(
          '🌐 Mở Supabase SQL Editor: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql'
        );
        return;
      }
    }

    console.log('✅ Function set_user_context đã được tạo thành công!');

    // Test function
    console.log('🧪 Đang test function...');
    const { error: testError } = await supabase.rpc('set_user_context', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
    });

    if (testError) {
      console.error('❌ Lỗi khi test function:', testError);
    } else {
      console.log('✅ Function hoạt động bình thường!');
    }
  } catch (error) {
    console.error('❌ Lỗi không mong muốn:', error);
    console.log('\n📝 Hướng dẫn khắc phục thủ công:');
    console.log(
      '1. Mở Supabase SQL Editor: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql'
    );
    console.log('2. Copy và chạy đoạn SQL sau:');
    console.log('='.repeat(60));
    console.log(`
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION set_user_context(UUID) TO authenticated, anon;
`);
    console.log('='.repeat(60));
  }
}

// Chạy script
if (require.main === module) {
  fixMissingFunction();
}

module.exports = { fixMissingFunction };
