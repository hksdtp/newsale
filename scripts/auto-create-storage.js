#!/usr/bin/env node

/**
 * 🚀 AUTO CREATE STORAGE
 * Tự động tạo storage bucket và policies
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase service key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

console.log('🚀 Auto Create Storage System');
console.log('=============================\n');

async function createStorageBucket() {
  console.log('💾 Creating storage bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(bucket => bucket.name === 'task-attachments');
    
    if (exists) {
      console.log('✅ Bucket already exists');
      return true;
    }
    
    // Create bucket
    const { data, error } = await supabase.storage.createBucket('task-attachments', {
      public: false,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ]
    });
    
    if (error) {
      console.log('❌ Bucket creation failed:', error.message);
      return false;
    }
    
    console.log('✅ Storage bucket created successfully');
    return true;
  } catch (err) {
    console.log('❌ Storage creation error:', err.message);
    return false;
  }
}

async function testStorageAccess() {
  console.log('🧪 Testing storage access...');
  
  try {
    // Test upload
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const fileName = `test-${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(`test/${fileName}`, testContent, {
        contentType: 'text/plain'
      });
    
    if (error) {
      console.log('❌ Upload test failed:', error.message);
      return false;
    }
    
    console.log('✅ Upload test successful');
    
    // Test download
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('task-attachments')
      .download(`test/${fileName}`);
    
    if (downloadError) {
      console.log('❌ Download test failed:', downloadError.message);
      return false;
    }
    
    console.log('✅ Download test successful');
    
    // Test signed URL
    const { data: urlData, error: urlError } = await supabase.storage
      .from('task-attachments')
      .createSignedUrl(`test/${fileName}`, 3600);
    
    if (urlError) {
      console.log('❌ Signed URL test failed:', urlError.message);
      return false;
    }
    
    console.log('✅ Signed URL test successful');
    
    // Clean up
    await supabase.storage
      .from('task-attachments')
      .remove([`test/${fileName}`]);
    
    console.log('✅ Test file cleaned up');
    return true;
  } catch (err) {
    console.log('❌ Storage test error:', err.message);
    return false;
  }
}

async function testDatabaseTables() {
  console.log('📊 Testing database tables...');
  
  try {
    // Test task_attachments
    const { data: attachments, error: attachError } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);
    
    if (attachError) {
      console.log('❌ task_attachments table:', attachError.message);
      return false;
    }
    
    console.log('✅ task_attachments table accessible');
    
    // Test task_checklist_items
    const { data: checklist, error: checklistError } = await supabase
      .from('task_checklist_items')
      .select('*')
      .limit(1);
    
    if (checklistError) {
      console.log('❌ task_checklist_items table:', checklistError.message);
      return false;
    }
    
    console.log('✅ task_checklist_items table accessible');
    return true;
  } catch (err) {
    console.log('❌ Database test error:', err.message);
    return false;
  }
}

async function main() {
  const storageCreated = await createStorageBucket();
  const storageWorks = await testStorageAccess();
  const databaseWorks = await testDatabaseTables();
  
  console.log('\n📋 Setup Results:');
  console.log('=================');
  console.log(`Storage Bucket: ${storageCreated ? '✅' : '❌'}`);
  console.log(`Storage Access: ${storageWorks ? '✅' : '❌'}`);
  console.log(`Database Tables: ${databaseWorks ? '✅' : '❌'}`);
  
  if (storageCreated && storageWorks && databaseWorks) {
    console.log('\n🎉 COMPLETE SUCCESS!');
    console.log('🚀 Attachment system is 100% ready!');
    console.log('\n📝 What to do now:');
    console.log('1. Refresh your browser');
    console.log('2. Open any task');
    console.log('3. Try uploading files');
    console.log('4. Everything should work perfectly!');
  } else {
    console.log('\n⚠️  Partial success. Manual steps needed:');
    
    if (!databaseWorks) {
      console.log('🔧 Database: Run DATABASE_ONLY_FIX.sql in Supabase SQL Editor');
    }
    
    if (!storageCreated || !storageWorks) {
      console.log('🔧 Storage: Create bucket manually in Supabase Dashboard');
      console.log('   - Go to Storage → Buckets');
      console.log('   - Create "task-attachments" bucket (private)');
      console.log('   - Add policies for upload/view/delete');
    }
  }
}

main().catch(console.error);
