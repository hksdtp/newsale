#!/usr/bin/env node

/**
 * Script to create retail director
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDirector() {
  console.log('👨‍💼 Creating retail director...\n');

  try {
    // First check if director already exists
    const { data: existingDirector, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director')
      .single();

    if (!checkError && existingDirector) {
      console.log('✅ Retail director already exists:', existingDirector.name);
      return;
    }

    // Check if email already exists
    const { data: existingUser, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'manh.khong@company.com')
      .single();

    if (!emailError && existingUser) {
      console.log('🔄 User with email exists, updating to retail director...');
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ 
          role: 'retail_director',
          department_type: 'Retail',
          name: 'Khổng Đức Mạnh'
        })
        .eq('email', 'manh.khong@company.com')
        .select()
        .single();

      if (updateError) {
        console.error('❌ Cannot update user:', updateError.message);
      } else {
        console.log('✅ Updated user to retail director:', updatedUser.name);
      }
    } else {
      console.log('🆕 Creating new retail director...');
      
      // Get a team ID for the director
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id')
        .limit(1);

      const teamId = teams && teams.length > 0 ? teams[0].id : null;

      const { data: newDirector, error: createError } = await supabase
        .from('users')
        .insert({
          email: 'manh.khong@company.com',
          name: 'Khổng Đức Mạnh',
          password: '123456',
          password_changed: false,
          team_id: teamId,
          location: 'Hà Nội',
          role: 'retail_director',
          department_type: 'Retail'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Cannot create director:', createError.message);
      } else {
        console.log('✅ Created retail director:', newDirector.name);
      }
    }

    // Verify the director was created/updated
    console.log('\n🔍 Verifying retail director...');
    const { data: director, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director')
      .single();

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log('✅ Retail director verified:');
      console.log(`   Name: ${director.name}`);
      console.log(`   Email: ${director.email}`);
      console.log(`   Role: ${director.role}`);
      console.log(`   Location: ${director.location}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

createDirector();
