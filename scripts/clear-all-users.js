const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAllUsers() {
  console.log('🗑️  Starting to clear all users...');

  try {
    // First, get all users
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email');

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('✅ No users found. Database is already empty.');
      return;
    }

    console.log(`📋 Found ${users.length} users to delete:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email})`);
    });

    // Delete users one by one
    console.log('🗑️  Deleting users...');
    for (const user of users) {
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id);

      if (deleteError) {
        console.error(`❌ Error deleting ${user.name}:`, deleteError);
      } else {
        console.log(`✅ Deleted: ${user.name}`);
      }
    }

    console.log('✅ All users deletion completed!');

    // Verify deletion
    const { data: remainingUsers, error: verifyError } = await supabase
      .from('users')
      .select('count');

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }

    console.log('🔍 Verification: Database is now empty');
    console.log('📤 Ready for new user data!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

clearAllUsers();
