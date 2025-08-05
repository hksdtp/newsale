#!/usr/bin/env node

/**
 * 🎯 FINAL VERIFICATION
 * Kiểm tra cuối cùng sau khi chạy SQL manual
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, anonKey);

console.log('🎯 Final Verification');
console.log('====================\n');

async function verify() {
  let allGood = true;
  
  // Test 1: task_attachments table
  try {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ task_attachments:', error.message);
      allGood = false;
    } else {
      console.log('✅ task_attachments table working');
    }
  } catch (err) {
    console.log('❌ task_attachments error:', err.message);
    allGood = false;
  }
  
  // Test 2: task_checklist_items table
  try {
    const { data, error } = await supabase
      .from('task_checklist_items')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ task_checklist_items:', error.message);
      allGood = false;
    } else {
      console.log('✅ task_checklist_items table working');
    }
  } catch (err) {
    console.log('❌ task_checklist_items error:', err.message);
    allGood = false;
  }
  
  // Test 3: Storage bucket
  try {
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .list('', { limit: 1 });
    
    if (error) {
      console.log('❌ Storage bucket:', error.message);
      allGood = false;
    } else {
      console.log('✅ Storage bucket working');
    }
  } catch (err) {
    console.log('❌ Storage bucket error:', err.message);
    allGood = false;
  }
  
  // Test 4: File upload
  try {
    const testContent = 'Final test file';
    const fileName = `final-test-${Date.now()}.txt`;
    
    const { data, error } = await supabase.storage
      .from('task-attachments')
      .upload(`test/${fileName}`, testContent);
    
    if (error) {
      console.log('❌ File upload:', error.message);
      allGood = false;
    } else {
      console.log('✅ File upload working');
      
      // Clean up
      await supabase.storage
        .from('task-attachments')
        .remove([`test/${fileName}`]);
    }
  } catch (err) {
    console.log('❌ File upload error:', err.message);
    allGood = false;
  }
  
  console.log('\n' + '='.repeat(40));
  
  if (allGood) {
    console.log('🎉 ALL SYSTEMS GO!');
    console.log('🚀 Attachment system is 100% ready!');
    console.log('\n📝 What you can do now:');
    console.log('1. Refresh your browser');
    console.log('2. Open any task');
    console.log('3. Upload files using the attachment feature');
    console.log('4. Files will be stored and displayed correctly');
  } else {
    console.log('⚠️  Some issues remain.');
    console.log('Please run the SQL in FINAL_ATTACHMENT_FIX.sql');
    console.log('in Supabase Dashboard SQL Editor.');
  }
}

verify().catch(console.error);
