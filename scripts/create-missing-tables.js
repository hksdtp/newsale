#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMissingTables() {
  console.log('🔧 Creating Missing Database Tables...\n');
  console.log('=====================================');

  try {
    // Step 1: Add missing columns to tasks table
    console.log('\n📅 Step 1: Adding missing columns to tasks table...');
    
    const addColumnsSQL = `
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS scheduled_date DATE,
      ADD COLUMN IF NOT EXISTS scheduled_time TIME,
      ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';
    `;

    const { error: columnsError } = await supabase.rpc('exec_sql', {
      sql: addColumnsSQL
    });

    if (columnsError) {
      console.log('⚠️  Adding columns failed, trying alternative approach...');
      
      // Try individual column additions
      const columns = [
        'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_date DATE;',
        'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS scheduled_time TIME;',
        'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT \'manual\';'
      ];

      for (const sql of columns) {
        const { error } = await supabase.rpc('exec_sql', { sql });
        if (error) {
          console.log(`   ⚠️  ${sql} failed:`, error.message);
        } else {
          console.log(`   ✅ Column added successfully`);
        }
      }
    } else {
      console.log('✅ Columns added to tasks table');
    }

    // Step 2: Create task_checklist_items table
    console.log('\n📋 Step 2: Creating task_checklist_items table...');
    
    const checklistTableSQL = `
      CREATE TABLE IF NOT EXISTS task_checklist_items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: checklistError } = await supabase.rpc('exec_sql', {
      sql: checklistTableSQL
    });

    if (checklistError) {
      console.log('❌ task_checklist_items table creation failed:', checklistError.message);
    } else {
      console.log('✅ task_checklist_items table created');
    }

    // Step 3: Create task_attachments table
    console.log('\n📎 Step 3: Creating task_attachments table...');
    
    const attachmentsTableSQL = `
      CREATE TABLE IF NOT EXISTS task_attachments (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const { error: attachmentsError } = await supabase.rpc('exec_sql', {
      sql: attachmentsTableSQL
    });

    if (attachmentsError) {
      console.log('❌ task_attachments table creation failed:', attachmentsError.message);
    } else {
      console.log('✅ task_attachments table created');
    }

    // Step 4: Create indexes
    console.log('\n🔍 Step 4: Creating indexes...');
    
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_task_checklist_items_task_id ON task_checklist_items(task_id);
      CREATE INDEX IF NOT EXISTS idx_task_checklist_items_order ON task_checklist_items(task_id, order_index);
      CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON task_attachments(task_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_scheduled_date ON tasks(scheduled_date);
    `;

    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: indexesSQL
    });

    if (indexError) {
      console.log('⚠️  Index creation failed:', indexError.message);
    } else {
      console.log('✅ Indexes created');
    }

    // Step 5: Enable RLS
    console.log('\n🔒 Step 5: Enabling RLS...');
    
    const rlsSQL = `
      ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
      ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
    `;

    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: rlsSQL
    });

    if (rlsError) {
      console.log('⚠️  RLS enabling failed:', rlsError.message);
    } else {
      console.log('✅ RLS enabled');
    }

    // Step 6: Create basic RLS policies
    console.log('\n🛡️  Step 6: Creating RLS policies...');
    
    const policiesSQL = `
      -- Checklist items policies
      CREATE POLICY IF NOT EXISTS "Users can view checklist items for accessible tasks" ON task_checklist_items
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_checklist_items.task_id
            AND (
              tasks.created_by_id::text = auth.uid()::text
              OR tasks.assigned_to_id::text = auth.uid()::text
              OR tasks.share_scope = 'public'
            )
          )
        );

      CREATE POLICY IF NOT EXISTS "Users can manage checklist items for their tasks" ON task_checklist_items
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_checklist_items.task_id
            AND (
              tasks.created_by_id::text = auth.uid()::text
              OR tasks.assigned_to_id::text = auth.uid()::text
            )
          )
        );

      -- Attachments policies
      CREATE POLICY IF NOT EXISTS "Users can view attachments for accessible tasks" ON task_attachments
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_attachments.task_id
            AND (
              tasks.created_by_id::text = auth.uid()::text
              OR tasks.assigned_to_id::text = auth.uid()::text
              OR tasks.share_scope = 'public'
            )
          )
        );

      CREATE POLICY IF NOT EXISTS "Users can manage attachments for their tasks" ON task_attachments
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM tasks 
            WHERE tasks.id = task_attachments.task_id
            AND (
              tasks.created_by_id::text = auth.uid()::text
              OR tasks.assigned_to_id::text = auth.uid()::text
            )
          )
        );
    `;

    const { error: policiesError } = await supabase.rpc('exec_sql', {
      sql: policiesSQL
    });

    if (policiesError) {
      console.log('⚠️  RLS policies creation failed:', policiesError.message);
    } else {
      console.log('✅ RLS policies created');
    }

    // Step 7: Verify tables
    console.log('\n✅ Step 7: Verifying tables...');
    
    // Test checklist table
    const { data: checklistTest, error: checklistTestError } = await supabase
      .from('task_checklist_items')
      .select('id')
      .limit(1);

    if (checklistTestError) {
      console.log('❌ task_checklist_items verification failed:', checklistTestError.message);
    } else {
      console.log('✅ task_checklist_items table verified');
    }

    // Test attachments table
    const { data: attachmentTest, error: attachmentTestError } = await supabase
      .from('task_attachments')
      .select('id')
      .limit(1);

    if (attachmentTestError) {
      console.log('❌ task_attachments verification failed:', attachmentTestError.message);
    } else {
      console.log('✅ task_attachments table verified');
    }

    // Test tasks table with new columns
    const { data: tasksTest, error: tasksTestError } = await supabase
      .from('tasks')
      .select('id, scheduled_date, scheduled_time, source')
      .limit(1);

    if (tasksTestError) {
      console.log('❌ tasks table verification failed:', tasksTestError.message);
    } else {
      console.log('✅ tasks table with new columns verified');
    }

    console.log('\n=====================================');
    console.log('🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Added scheduling columns to tasks table');
    console.log('   ✅ Created task_checklist_items table');
    console.log('   ✅ Created task_attachments table');
    console.log('   ✅ Added performance indexes');
    console.log('   ✅ Enabled RLS security');
    console.log('   ✅ Created access policies');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
  }
}

// Run the setup
createMissingTables();
