#!/usr/bin/env node

/**
 * Simple script to check existing data
 * Run with: node scripts/simple-check.js
 */

require('dotenv').config({ path: '.env.local' });

async function simpleCheck() {
  console.log('🔍 Checking existing data in Supabase...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔗 Connected to Supabase successfully\n');

    // Check teams table
    console.log('📊 TEAMS TABLE:');
    try {
      const { data: teams, error } = await supabase
        .from('teams')
        .select('*');

      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log(`✅ Found ${teams?.length || 0} teams:`);
        teams?.forEach((team, index) => {
          console.log(`   ${index + 1}. ID: ${team.id} | Name: ${team.name}`);
        });
      }
    } catch (err) {
      console.log('❌ Teams table error:', err.message);
    }

    console.log('\n📊 LOCATIONS TABLE:');
    try {
      const { data: locations, error } = await supabase
        .from('locations')
        .select('*');

      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log(`✅ Found ${locations?.length || 0} locations:`);
        locations?.forEach((location, index) => {
          console.log(`   ${index + 1}. ID: ${location.id} | Name: ${location.name} | Team ID: ${location.team_id || 'N/A'}`);
        });
      }
    } catch (err) {
      console.log('❌ Locations table error:', err.message);
    }

    console.log('\n📊 MEMBERS TABLE:');
    try {
      const { data: members, error } = await supabase
        .from('members')
        .select('*');

      if (error) {
        console.log('❌ Error:', error.message);
      } else {
        console.log(`✅ Found ${members?.length || 0} members:`);
        members?.forEach((member, index) => {
          console.log(`   ${index + 1}. ID: ${member.id} | Name: ${member.name} | Email: ${member.email}`);
          console.log(`      Team ID: ${member.team_id || 'N/A'} | Role: ${member.role || 'N/A'}`);
        });
      }
    } catch (err) {
      console.log('❌ Members table error:', err.message);
    }

    // Try to check what tables actually exist
    console.log('\n🔍 CHECKING AVAILABLE TABLES:');
    
    const tablesToCheck = ['teams', 'locations', 'members', 'users', 'profiles', 'employees', 'staff'];
    
    for (const tableName of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error) {
          console.log(`✅ Table '${tableName}' exists`);
        }
      } catch (err) {
        // Table doesn't exist, skip
      }
    }

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

simpleCheck();
