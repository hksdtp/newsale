#!/usr/bin/env node

/**
 * Script to update admin user to retail director
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

async function updateAdminToDirector() {
  console.log('🔄 Updating admin user to retail director...\n');

  try {
    // Update the admin user to be retail director
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ 
        role: 'retail_director',
        department_type: 'Retail',
        name: 'Khổng Đức Mạnh',
        email: 'manh.khong@company.com'
      })
      .eq('email', 'admin@company.com')
      .select()
      .single();

    if (updateError) {
      console.error('❌ Cannot update admin user:', updateError.message);
      
      // Try updating by ID instead
      console.log('🔄 Trying to update by ID...');
      const { data: updatedById, error: updateByIdError } = await supabase
        .from('users')
        .update({ 
          role: 'retail_director',
          department_type: 'Retail',
          name: 'Khổng Đức Mạnh',
          email: 'manh.khong@company.com'
        })
        .eq('id', '00d7519b-3726-43cb-a4ce-cc3495506b1f')
        .select()
        .single();

      if (updateByIdError) {
        console.error('❌ Cannot update by ID:', updateByIdError.message);
      } else {
        console.log('✅ Updated user by ID to retail director:', updatedById.name);
      }
    } else {
      console.log('✅ Updated admin to retail director:', updatedUser.name);
    }

    // Verify the director was created/updated
    console.log('\n🔍 Verifying retail director...');
    const { data: directors, error: verifyError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director');

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message);
    } else {
      console.log(`✅ Found ${directors?.length || 0} retail directors:`);
      if (directors && directors.length > 0) {
        directors.forEach((director, index) => {
          console.log(`   ${index + 1}. ${director.name} (${director.email})`);
        });
      }
    }

    // Test the specific query that was failing
    console.log('\n🧪 Testing director query...');
    const { data: director, error: testError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director')
      .single();

    if (testError) {
      console.error('❌ Single director query failed:', testError.message);
    } else {
      console.log('✅ Single director query successful:', director.name);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

updateAdminToDirector();
