#!/usr/bin/env node

/**
 * 🧪 SIMPLE ATTACHMENT TEST
 * Test cơ bản để verify attachment system
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🧪 Simple Attachment Test');
console.log('=========================\n');

console.log('📋 Configuration:');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${anonKey ? anonKey.substring(0, 20) + '...' : 'Missing'}\n`);

if (!supabaseUrl || !anonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, anonKey);

async function testBasicConnection() {
  console.log('🔌 Testing basic connection...');
  
  try {
    // Test simple query
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Basic connection working');
    console.log(`   Found ${data?.length || 0} tasks`);
    return true;
  } catch (err) {
    console.log('❌ Connection error:', err.message);
    return false;
  }
}

async function testAttachmentsTable() {
  console.log('📎 Testing task_attachments table...');
  
  try {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Attachments table error:', error.message);
      return false;
    }
    
    console.log('✅ task_attachments table accessible');
    console.log(`   Found ${data?.length || 0} attachments`);
    return true;
  } catch (err) {
    console.log('❌ Attachments table error:', err.message);
    return false;
  }
}

async function testStorageBucket() {
  console.log('💾 Testing storage bucket...');
  
  try {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Storage bucket error:', error.message);
      return false;
    }
    
    console.log('✅ Storage bucket accessible');
    console.log(`   Found ${data?.length || 0} files`);
    return true;
  } catch (err) {
    console.log('❌ Storage bucket error:', err.message);
    return false;
  }
}

async function testFileUpload() {
  console.log('📤 Testing file upload...');
  
  try {
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const fileName = `test-${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(`test/${fileName}`, testContent, {
        contentType: 'text/plain'
      });
    
    if (error) {
      console.log('❌ Upload failed:', error.message);
      return false;
    }
    
    console.log('✅ File upload successful');
    console.log(`   File: ${data.path}`);
    
    // Clean up
    await supabase.storage
      .from('task-attachments')
      .remove([`test/${fileName}`]);
    
    console.log('✅ Test file cleaned up');
    return true;
  } catch (err) {
    console.log('❌ Upload error:', err.message);
    return false;
  }
}

async function main() {
  const connectionTest = await testBasicConnection();
  const attachmentsTest = await testAttachmentsTable();
  const storageTest = await testStorageBucket();
  const uploadTest = await testFileUpload();
  
  console.log('\n📋 Test Summary:');
  console.log('================');
  console.log(`Basic Connection: ${connectionTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Attachments Table: ${attachmentsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Storage Bucket: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`File Upload: ${uploadTest ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = connectionTest && attachmentsTest && storageTest && uploadTest;
  
  if (allPassed) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('🚀 Attachment system is ready to use!');
    console.log('\n📝 Next steps:');
    console.log('1. Refresh your browser');
    console.log('2. Try uploading a file in a task');
    console.log('3. Check if attachments appear correctly');
  } else {
    console.log('\n⚠️  Some tests failed.');
    console.log('Please check the errors above.');
    
    if (!attachmentsTest) {
      console.log('\n🔧 To fix attachments table:');
      console.log('1. Go to Supabase Dashboard');
      console.log('2. Run the SQL in ATTACHMENT_SETUP.sql');
    }
    
    if (!storageTest || !uploadTest) {
      console.log('\n🔧 To fix storage:');
      console.log('1. Go to Supabase Dashboard > Storage');
      console.log('2. Create bucket "task-attachments"');
      console.log('3. Set it to private');
    }
  }
}

main().catch(console.error);
