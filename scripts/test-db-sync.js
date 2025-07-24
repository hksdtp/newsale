#!/usr/bin/env node

/**
 * Script to test database synchronization
 * Run with: node scripts/test-db-sync.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseSync() {
  console.log('🔍 Testing Database Synchronization...\n');
  
  let errors = [];
  let warnings = [];
  
  try {
    // 1. Test users table
    console.log('📊 Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5);
    
    if (usersError) {
      errors.push(`Users table error: ${usersError.message}`);
      console.log('❌ Users table: NOT ACCESSIBLE');
    } else {
      console.log(`✅ Users table: ${users?.length || 0} records found`);
      if (users && users.length > 0) {
        console.log('   Sample users:');
        users.slice(0, 3).forEach(user => {
          console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      }
    }
    
    // 2. Test tasks table
    console.log('\n📊 Checking tasks table...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);
    
    if (tasksError) {
      errors.push(`Tasks table error: ${tasksError.message}`);
      console.log('❌ Tasks table: NOT ACCESSIBLE');
    } else {
      console.log(`✅ Tasks table: ${tasks?.length || 0} records found`);
      
      // Check for share_scope column
      if (tasks && tasks.length > 0 && !tasks[0].hasOwnProperty('share_scope')) {
        warnings.push('Tasks table missing share_scope column');
      }
    }
    
    // 3. Test teams table
    console.log('\n📊 Checking teams table...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
    
    if (teamsError) {
      errors.push(`Teams table error: ${teamsError.message}`);
      console.log('❌ Teams table: NOT ACCESSIBLE');
    } else {
      console.log(`✅ Teams table: ${teams?.length || 0} records found`);
    }
    
    // 4. Test authentication
    console.log('\n🔐 Testing authentication...');
    if (users && users.length > 0) {
      const testUser = users[0];
      console.log(`   Testing login with: ${testUser.email}`);
      
      // Check password_changed field
      if (!testUser.hasOwnProperty('password_changed')) {
        warnings.push('Users table missing password_changed column');
      }
    }
    
    // 5. Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 SYNCHRONIZATION SUMMARY\n');
    
    if (errors.length === 0) {
      console.log('✅ Database connection: WORKING');
      console.log('✅ All tables accessible');
    } else {
      console.log('❌ Database has errors:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      warnings.forEach(warn => console.log(`   - ${warn}`));
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:\n');
    
    if (errors.includes('Users table error: relation "users" does not exist')) {
      console.log('1. Run the migration script:');
      console.log('   - Go to Supabase SQL Editor');
      console.log('   - Copy content from database/migrate_to_users_table.sql');
      console.log('   - Execute the script');
    }
    
    if (warnings.includes('Tasks table missing share_scope column')) {
      console.log('2. Update tasks table structure');
      console.log('   - Add share_scope column to tasks table');
    }
    
    if (errors.length === 0 && warnings.length === 0) {
      console.log('🎉 Your database is fully synchronized!');
      console.log('   You can now use the application with full Supabase integration.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testDatabaseSync();
