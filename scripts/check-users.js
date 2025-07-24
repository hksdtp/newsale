#!/usr/bin/env node

/**
 * Check users table structure and data
 */

require('dotenv').config({ path: '.env.local' });

async function checkUsers() {
  console.log('🔍 Analyzing USERS table...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all users data
    const { data: users, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      console.log('❌ Error:', error.message);
      return;
    }

    console.log(`✅ Found ${users?.length || 0} users in database\n`);

    if (users && users.length > 0) {
      console.log('👥 USER LIST:');
      console.log('=' .repeat(80));
      
      users.forEach((user, index) => {
        console.log(`${index + 1}. USER DETAILS:`);
        
        // Print all fields
        Object.keys(user).forEach(key => {
          const value = user[key];
          if (value !== null && value !== undefined) {
            console.log(`   ${key}: ${value}`);
          }
        });
        console.log('   ' + '-'.repeat(50));
      });

      console.log('\n📊 FIELD ANALYSIS:');
      
      // Analyze fields
      const allFields = new Set();
      users.forEach(user => {
        Object.keys(user).forEach(key => allFields.add(key));
      });

      console.log('📋 Available fields:');
      Array.from(allFields).sort().forEach(field => {
        const sampleValue = users.find(u => u[field] !== null && u[field] !== undefined)?.[field];
        console.log(`   - ${field}: ${typeof sampleValue} (example: ${sampleValue})`);
      });

      // Check for authentication-related fields
      console.log('\n🔐 AUTHENTICATION FIELDS CHECK:');
      const authFields = ['email', 'password', 'password_hash', 'username', 'login', 'name', 'full_name'];
      
      authFields.forEach(field => {
        const hasField = allFields.has(field);
        const sampleValue = hasField ? users.find(u => u[field])?.[field] : null;
        console.log(`   ${hasField ? '✅' : '❌'} ${field}: ${hasField ? `"${sampleValue}"` : 'Not found'}`);
      });

      // Check team relationships
      console.log('\n🏢 TEAM RELATIONSHIP CHECK:');
      const teamFields = ['team_id', 'team', 'group_id', 'department'];
      
      teamFields.forEach(field => {
        const hasField = allFields.has(field);
        const sampleValue = hasField ? users.find(u => u[field])?.[field] : null;
        console.log(`   ${hasField ? '✅' : '❌'} ${field}: ${hasField ? `"${sampleValue}"` : 'Not found'}`);
      });

    } else {
      console.log('ℹ️  No users found in database');
    }

    // Also check teams table for reference
    console.log('\n🏢 TEAMS REFERENCE:');
    const { data: teams } = await supabase
      .from('teams')
      .select('*');

    if (teams) {
      teams.forEach(team => {
        console.log(`   Team ID ${team.id}: ${team.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkUsers();
