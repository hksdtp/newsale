#!/usr/bin/env node

/**
 * 🚨 CRITICAL SECURITY FIX SCRIPT
 * This script applies the RLS security fix for the tasks table
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fnakxavwxubnbucfoujd.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

// Create Supabase client with service key
const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSecurityFix() {
  console.log('🚨 Starting CRITICAL SECURITY FIX for RLS policies...');
  
  try {
    // Read the migration file
    const migrationPath = join(__dirname, '../supabase/migrations/20250812_fix_tasks_rls_security.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          throw error;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (statementError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, statementError);
        console.log('Statement:', statement);
        throw statementError;
      }
    }
    
    console.log('🎉 SECURITY FIX COMPLETED SUCCESSFULLY!');
    console.log('');
    console.log('✅ RLS policies have been updated with proper security controls');
    console.log('✅ Users can now only see tasks they have permission to access');
    console.log('✅ Authentication context functions have been created');
    console.log('');
    console.log('🔄 Next steps:');
    console.log('1. Restart your application');
    console.log('2. Test that users can only see their own tasks');
    console.log('3. Verify that Mai Tiến Đạt\'s tasks are no longer visible to other users');
    
  } catch (error) {
    console.error('❌ SECURITY FIX FAILED:', error);
    console.log('');
    console.log('🚨 CRITICAL: The security vulnerability is still present!');
    console.log('Please contact the development team immediately.');
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function runSecurityFixDirect() {
  console.log('🚨 Running DIRECT SQL execution for security fix...');
  
  const sqlStatements = [
    // Drop insecure policies
    `DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks`,
    `DROP POLICY IF EXISTS "Enable all operations on tasks" ON tasks`,
    
    // Create secure policies
    `CREATE POLICY "Users can view their own created tasks" ON tasks
     FOR SELECT USING (created_by_id::text = auth.uid()::text)`,
    
    `CREATE POLICY "Users can view assigned tasks" ON tasks
     FOR SELECT USING (assigned_to_id::text = auth.uid()::text)`,
    
    `CREATE POLICY "Users can create tasks" ON tasks
     FOR INSERT WITH CHECK (created_by_id::text = auth.uid()::text)`,
    
    `CREATE POLICY "Users can update their own tasks" ON tasks
     FOR UPDATE USING (created_by_id::text = auth.uid()::text)`,
    
    `CREATE POLICY "Users can delete their own tasks" ON tasks
     FOR DELETE USING (created_by_id::text = auth.uid()::text)`
  ];
  
  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`⚡ Executing: ${sql.substring(0, 50)}...`);
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.error(`❌ Error:`, error);
        throw error;
      }
      console.log(`✅ Success`);
    } catch (error) {
      console.error(`❌ Failed:`, error);
      throw error;
    }
  }
  
  console.log('🎉 DIRECT SECURITY FIX COMPLETED!');
}

// Run the security fix
if (process.argv.includes('--direct')) {
  runSecurityFixDirect().catch(console.error);
} else {
  runSecurityFix().catch(console.error);
}
