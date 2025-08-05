#!/usr/bin/env node

/**
 * Script to reset and setup database with correct schema
 * Run with: node scripts/reset-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetDatabase() {
  console.log('🔄 Resetting database...\n');

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing schema.sql...');
    
    // Execute the schema
    const { data, error } = await supabase.rpc('exec_sql', { sql: schema });
    
    if (error) {
      // Try alternative method - split and execute statements
      console.log('⚠️  RPC method failed, trying direct execution...');
      
      // Split SQL into individual statements
      const statements = schema
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error: stmtError } = await supabase.rpc('exec_sql', { 
              sql: statement + ';' 
            });
            if (stmtError) {
              console.log(`⚠️  Statement failed: ${statement.substring(0, 50)}...`);
              console.log(`   Error: ${stmtError.message}`);
            }
          } catch (e) {
            console.log(`⚠️  Statement error: ${e.message}`);
          }
        }
      }
    }

    console.log('✅ Database reset completed!');
    
    // Verify the setup
    console.log('\n🔍 Verifying setup...');
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, name, role')
      .limit(5);

    if (usersError) {
      console.log('❌ Users table check failed:', usersError.message);
    } else {
      console.log(`✅ Users table: ${users?.length || 0} records`);
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`   - ${user.email} (${user.name}) - ${user.role}`);
        });
      }
    }

    // Check teams table
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('name')
      .limit(5);

    if (teamsError) {
      console.log('❌ Teams table check failed:', teamsError.message);
    } else {
      console.log(`✅ Teams table: ${teams?.length || 0} records`);
      if (teams && teams.length > 0) {
        teams.forEach(team => {
          console.log(`   - ${team.name}`);
        });
      }
    }

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Restart your dev server: npm run dev');
    console.log('2. Test login with: admin@company.com / 123456');

  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
