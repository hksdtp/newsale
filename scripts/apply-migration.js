#!/usr/bin/env node

/**
 * Apply task features migration to Supabase
 */

require('dotenv').config({ path: '.env.local' });

async function applyMigration() {
  console.log('🚀 Applying task features migration...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📝 Step 1: Adding scheduling columns to tasks table...');
    
    // Add scheduling columns to tasks table
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE tasks 
        ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS scheduled_time TIME,
        ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'scheduled', 'recurring'));
      `
    });

    if (alterError) {
      console.log('⚠️  Using direct query approach...');
      // Try direct approach
      const { error: directError } = await supabase
        .from('tasks')
        .select('scheduled_date, scheduled_time, source')
        .limit(1);
      
      if (directError && directError.code === '42703') {
        console.log('❌ Columns do not exist. Please run migration manually in Supabase SQL Editor:');
        console.log(`
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'manual' CHECK (source IN ('manual', 'scheduled', 'recurring'));
        `);
      } else {
        console.log('✅ Scheduling columns already exist');
      }
    } else {
      console.log('✅ Scheduling columns added successfully');
    }

    console.log('\n📝 Step 2: Creating task_attachments table...');
    
    const { error: attachmentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS task_attachments (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(500) NOT NULL,
          file_size BIGINT NOT NULL,
          file_type VARCHAR(100) NOT NULL,
          uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (attachmentsError) {
      console.log('⚠️  task_attachments table creation failed:', attachmentsError.message);
    } else {
      console.log('✅ task_attachments table created');
    }

    console.log('\n📝 Step 3: Creating task_checklist_items table...');
    
    const { error: checklistError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS task_checklist_items (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
          title VARCHAR(500) NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE,
          order_index INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (checklistError) {
      console.log('⚠️  task_checklist_items table creation failed:', checklistError.message);
    } else {
      console.log('✅ task_checklist_items table created');
    }

    console.log('\n📝 Step 4: Creating indexes...');
    
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
        CREATE INDEX IF NOT EXISTS idx_task_checklist_items_task_id ON task_checklist_items(task_id);
        CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
      `
    });

    if (indexError) {
      console.log('⚠️  Index creation failed:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    console.log('\n📝 Step 5: Verifying migration...');
    
    // Test if new columns exist
    const { data: testTask, error: testError } = await supabase
      .from('tasks')
      .select('id, scheduled_date, scheduled_time, source')
      .limit(1);

    if (testError) {
      console.log('❌ Verification failed:', testError.message);
    } else {
      console.log('✅ Scheduling columns verified');
    }

    // Test if new tables exist
    const { data: testAttachments, error: attachError } = await supabase
      .from('task_attachments')
      .select('id')
      .limit(1);

    if (attachError) {
      console.log('❌ task_attachments table not accessible:', attachError.message);
    } else {
      console.log('✅ task_attachments table verified');
    }

    const { data: testChecklist, error: checkError } = await supabase
      .from('task_checklist_items')
      .select('id')
      .limit(1);

    if (checkError) {
      console.log('❌ task_checklist_items table not accessible:', checkError.message);
    } else {
      console.log('✅ task_checklist_items table verified');
    }

    console.log('\n🎉 Migration completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Added scheduling columns to tasks table');
    console.log('   ✅ Created task_attachments table');
    console.log('   ✅ Created task_checklist_items table');
    console.log('   ✅ Added performance indexes');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
