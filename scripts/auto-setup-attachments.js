#!/usr/bin/env node

/**
 * 🚀 AUTO SETUP ATTACHMENT SYSTEM
 * Tự động tạo tất cả những gì cần thiết cho hệ thống attachment
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Need: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🚀 Starting Attachment System Auto Setup...\n');

async function setupDatabase() {
  console.log('📊 Setting up database tables...');
  
  const setupSQL = `
    -- Add missing columns to tasks table
    ALTER TABLE tasks 
    ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS scheduled_time TIME,
    ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual';

    -- Create task_attachments table
    CREATE TABLE IF NOT EXISTS task_attachments (
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

    -- Create task_checklist_items table
    CREATE TABLE IF NOT EXISTS task_checklist_items (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      task_id UUID NOT NULL,
      title VARCHAR(500) NOT NULL,
      is_completed BOOLEAN DEFAULT FALSE,
      order_index INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
    CREATE INDEX IF NOT EXISTS idx_task_checklist_items_task_id ON task_checklist_items(task_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);

    -- Disable RLS for now
    ALTER TABLE task_attachments DISABLE ROW LEVEL SECURITY;
    ALTER TABLE task_checklist_items DISABLE ROW LEVEL SECURITY;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: setupSQL });
    if (error) {
      // Try direct query if RPC fails
      const { error: directError } = await supabase
        .from('task_attachments')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        console.log('⚠️  Tables need to be created manually. Check ATTACHMENT_SETUP.sql');
        return false;
      }
    }
    console.log('✅ Database tables ready');
    return true;
  } catch (err) {
    console.log('⚠️  Database setup may need manual intervention');
    return true; // Continue anyway
  }
}

async function setupStorage() {
  console.log('💾 Setting up storage bucket...');
  
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === 'task-attachments');
    
    if (!bucketExists) {
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
        console.log('⚠️  Bucket creation failed, trying SQL method...');
        return await setupStorageSQL();
      }
      
      console.log('✅ Storage bucket created');
    } else {
      console.log('✅ Storage bucket already exists');
    }
    
    return true;
  } catch (err) {
    console.log('⚠️  Storage setup failed, trying SQL method...');
    return await setupStorageSQL();
  }
}

async function setupStorageSQL() {
  const bucketSQL = `
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES (
      'task-attachments', 
      'task-attachments', 
      false, 
      52428800, 
      ARRAY[
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
    )
    ON CONFLICT (id) DO NOTHING;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: bucketSQL });
    if (!error) {
      console.log('✅ Storage bucket created via SQL');
      return true;
    }
  } catch (err) {
    // Ignore error, bucket might already exist
  }
  
  return true;
}

async function setupStoragePolicies() {
  console.log('🔐 Setting up storage policies...');
  
  const policiesSQL = `
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow authenticated upload task attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated view task attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Allow authenticated delete task attachments" ON storage.objects;
    
    -- Create new policies
    CREATE POLICY "Allow authenticated upload task attachments" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'task-attachments');
    
    CREATE POLICY "Allow authenticated view task attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'task-attachments');
    
    CREATE POLICY "Allow authenticated delete task attachments" ON storage.objects
    FOR DELETE USING (bucket_id = 'task-attachments');
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    if (error) {
      console.log('⚠️  Storage policies need manual setup in Dashboard');
      return false;
    }
    console.log('✅ Storage policies created');
    return true;
  } catch (err) {
    console.log('⚠️  Storage policies need manual setup in Dashboard');
    return false;
  }
}

async function verifySetup() {
  console.log('🧪 Verifying setup...');
  
  try {
    // Check tables
    const { data: attachments, error: attachError } = await supabase
      .from('task_attachments')
      .select('id')
      .limit(1);
    
    if (attachError) {
      console.log('❌ task_attachments table not accessible');
      return false;
    }
    
    const { data: checklist, error: checklistError } = await supabase
      .from('task_checklist_items')
      .select('id')
      .limit(1);
    
    if (checklistError) {
      console.log('❌ task_checklist_items table not accessible');
      return false;
    }
    
    // Check storage
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === 'task-attachments');
    
    if (!bucketExists) {
      console.log('❌ task-attachments bucket not found');
      return false;
    }
    
    console.log('✅ All systems verified and ready!');
    return true;
  } catch (err) {
    console.log('❌ Verification failed:', err.message);
    return false;
  }
}

async function main() {
  try {
    console.log('🔧 Auto Setup Attachment System');
    console.log('================================\n');
    
    const dbSuccess = await setupDatabase();
    const storageSuccess = await setupStorage();
    const policiesSuccess = await setupStoragePolicies();
    const verifySuccess = await verifySetup();
    
    console.log('\n📋 Setup Summary:');
    console.log('================');
    console.log(`Database Tables: ${dbSuccess ? '✅' : '⚠️'}`);
    console.log(`Storage Bucket: ${storageSuccess ? '✅' : '⚠️'}`);
    console.log(`Storage Policies: ${policiesSuccess ? '✅' : '⚠️'}`);
    console.log(`Verification: ${verifySuccess ? '✅' : '❌'}`);
    
    if (verifySuccess) {
      console.log('\n🎉 ATTACHMENT SYSTEM READY!');
      console.log('You can now upload files in tasks.');
    } else {
      console.log('\n⚠️  Some manual setup may be required.');
      console.log('Check ATTACHMENT_SETUP.sql for manual steps.');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
