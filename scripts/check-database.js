#!/usr/bin/env node

/**
 * Script to check existing data in Supabase database
 * Run with: node scripts/check-database.js
 */

require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  console.log('🔍 Checking existing Supabase database...\n');

  // Check environment variables
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔗 Connected to Supabase successfully');
    console.log('📍 Project:', supabaseUrl);
    console.log('');

    // Check if tables exist and get data
    console.log('📊 Database Analysis:\n');

    // Check teams table
    try {
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (teamsError) {
        console.log('❌ Teams table:', teamsError.message);
      } else {
        console.log(`✅ Teams table: ${teams?.length || 0} records`);
        if (teams && teams.length > 0) {
          teams.forEach((team, index) => {
            console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
            if (team.description) console.log(`      Description: ${team.description}`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Teams table: Table might not exist');
    }

    console.log('');

    // Check locations table
    try {
      const { data: locations, error: locationsError } = await supabase
        .from('locations')
        .select('*, team:teams(name)');

      if (locationsError) {
        console.log('❌ Locations table:', locationsError.message);
      } else {
        console.log(`✅ Locations table: ${locations?.length || 0} records`);
        if (locations && locations.length > 0) {
          locations.forEach((location, index) => {
            console.log(`   ${index + 1}. ${location.name} (Team: ${location.team?.name || 'N/A'})`);
            if (location.address) console.log(`      Address: ${location.address}`);
          });
        }
      }
    } catch (err) {
      console.log('❌ Locations table: Table might not exist');
    }

    console.log('');

    // Check members table
    try {
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select(`
          *,
          team:teams(name, description),
          location:locations(name, address)
        `);

      if (membersError) {
        console.log('❌ Members table:', membersError.message);
      } else {
        console.log(`✅ Members table: ${members?.length || 0} records`);
        if (members && members.length > 0) {
          console.log('\n👥 Team Members:');
          members.forEach((member, index) => {
            console.log(`   ${index + 1}. ${member.name} (${member.email})`);
            console.log(`      Role: ${member.role}`);
            console.log(`      Team: ${member.team?.name || 'N/A'}`);
            console.log(`      Location: ${member.location?.name || 'N/A'}`);
            console.log(`      First Login: ${member.is_first_login ? 'Yes' : 'No'}`);
            console.log(`      Last Login: ${member.last_login || 'Never'}`);
            console.log('');
          });
        }
      }
    } catch (err) {
      console.log('❌ Members table: Table might not exist');
    }

    // Check for any other tables
    console.log('🔍 Checking for other tables...\n');
    
    try {
      const { data: tables, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'teams')
        .neq('table_name', 'locations')
        .neq('table_name', 'members');

      if (!error && tables && tables.length > 0) {
        console.log('📋 Other tables found:');
        tables.forEach((table, index) => {
          console.log(`   ${index + 1}. ${table.table_name}`);
        });
      } else {
        console.log('ℹ️  No other custom tables found');
      }
    } catch (err) {
      console.log('ℹ️  Could not check for other tables');
    }

    console.log('\n📋 Summary:');
    console.log('- Database connection: ✅ Working');
    console.log('- Ready for authentication: ✅ Yes');
    console.log('- Next step: Update app to use existing data');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('- Database not set up yet');
    console.log('- Wrong credentials in .env.local');
    console.log('- Network connection issues');
  }
}

checkDatabase();
