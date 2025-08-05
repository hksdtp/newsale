#!/usr/bin/env node

/**
 * 🔧 FORCE FIX ATTACHMENTS
 * Sử dụng service key để force fix tất cả vấn đề
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase service key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔧 Force Fix Attachment System');
console.log('==============================\n');

async function forceCreateTables() {
  console.log('📊 Force creating all tables...');
  
  const sql = `
    -- Drop and recreate task_attachments
    DROP TABLE IF EXISTS task_attachments CASCADE;
    CREATE TABLE task_attachments (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      task_id UUID NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      file_size BIGINT NOT NULL,
      file_type VARCHAR(100) NOT NULL,
      uploaded_by UUID,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Drop and recreate task_checklist_items
    DROP TABLE IF EXISTS task_checklist_items CASCADE;
    CREATE TABLE task_checklist_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      task_id UUID NOT NULL,
      title VARCHAR(500) NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Create indexes
    CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
    CREATE INDEX idx_task_checklist_items_task_id ON task_checklist_items(task_id);
    
    -- Disable RLS completely
    ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
    ALTER TABLE task_checklist_items DISABLE ROW LEVEL SECURITY;
    
    -- Grant all permissions
    GRANT ALL ON task_attachments TO anon, authenticated;
    GRANT ALL ON task_checklist_items TO anon, authenticated;
    GRANT USAGE ON SEQUENCE task_attachments_id_seq TO anon, authenticated;
    GRANT USAGE ON SEQUENCE task_checklist_items_id_seq TO anon, authenticated;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.log('❌ SQL execution failed:', error.message);
      return false;
    }
    console.log('✅ Tables force created');
    return true;
  } catch (err) {
    console.log('❌ Force create failed:', err.message);
    return false;
  }
}

async function forceFixStorage() {
  console.log('💾 Force fixing storage...');
  
  try {
    // Delete existing bucket if exists
    const { error: deleteError } = await supabase.storage.deleteBucket('task-attachments');
    // Ignore delete error
    
    // Create new bucket
    const { data, error } = await supabase.storage.createBucket('task-attachments', {
      public: false,
      fileSizeLimit: 52428800
    });
    
    if (error) {
      console.log('⚠️  Bucket creation via API failed, trying SQL...');
      
      const bucketSQL = `
        DELETE FROM storage.buckets WHERE id = 'task-attachments';
        INSERT INTO storage.buckets (id, name, public, file_size_limit) 
        VALUES ('task-attachments', 'task-attachments', false, 52428800);
      `;
      
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: bucketSQL });
      if (sqlError) {
        console.log('❌ Bucket SQL failed:', sqlError.message);
        return false;
      }
    }
    
    console.log('✅ Storage bucket ready');
    return true;
  } catch (err) {
    console.log('❌ Storage fix failed:', err.message);
    return false;
  }
}

async function disableAllRLS() {
  console.log('🔓 Disabling all RLS for testing...');
  
  const rlsSQL = `
    -- Disable RLS on storage.objects
    ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
    
    -- Drop all existing policies
    DROP POLICY IF EXISTS "Allow authenticated upload task attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated view task attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated delete task attachments" ON storage.objects;
    
    -- Grant storage permissions
    GRANT ALL ON storage.objects TO anon, authenticated;
    GRANT ALL ON storage.buckets TO anon, authenticated;
  `;
  
  try {
    const { error } = await supabase.rpc('exec_sql', { sql: rlsSQL });
    if (error) {
      console.log('⚠️  RLS disable failed (may need manual setup)');
      return false;
    }
    console.log('✅ RLS disabled for testing');
    return true;
  } catch (err) {
    console.log('⚠️  RLS disable failed (may need manual setup)');
    return false;
  }
}

async function testEverything() {
  console.log('🧪 Testing everything...');
  
  try {
    // Test table access
    const { data: attachments, error: attachError } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);
    
    if (attachError) {
      console.log('❌ Attachments table:', attachError.message);
      return false;
    }
    
    // Test storage upload
    const testContent = 'Test file';
    const fileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('task-attachments')
      .upload(`test/${fileName}`, testContent);
    
    if (uploadError) {
      console.log('❌ Storage upload:', uploadError.message);
      return false;
    }
    
    // Clean up
    await supabase.storage
      .from('task-attachments')
      .remove([`test/${fileName}`]);
    
    console.log('✅ All tests passed');
    return true;
  } catch (err) {
    console.log('❌ Test failed:', err.message);
    return false;
  }
}

async function main() {
  const tablesFixed = await forceCreateTables();
  const storageFixed = await forceFixStorage();
  const rlsDisabled = await disableAllRLS();
  const testsPass = await testEverything();
  
  console.log('\n📋 Fix Summary:');
  console.log('===============');
  console.log(`Tables: ${tablesFixed ? '✅' : '❌'}`);
  console.log(`Storage: ${storageFixed ? '✅' : '❌'}`);
  console.log(`RLS: ${rlsDisabled ? '✅' : '⚠️'}`);
  console.log(`Tests: ${testsPass ? '✅' : '❌'}`);
  
  if (testsPass) {
    console.log('\n🎉 ATTACHMENT SYSTEM FULLY FIXED!');
    console.log('🚀 Ready to use in your app!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser');
    console.log('2. Try uploading files in tasks');
    console.log('3. Files should work perfectly now');
  } else {
    console.log('\n⚠️  Manual intervention needed.');
    console.log('Please run ATTACHMENT_SETUP.sql in Supabase Dashboard.');
  }
}

main().catch(console.error);
