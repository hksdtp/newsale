const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function importNewUsers(userData) {
  console.log('📥 Starting to import new user data...');

  try {
    // First, show current users
    const { data: currentUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, name, email');

    if (fetchError) {
      console.error('❌ Error fetching current users:', fetchError);
      return;
    }

    if (currentUsers && currentUsers.length > 0) {
      console.log(`⚠️  Found ${currentUsers.length} existing users:`);
      currentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`);
      });
      console.log('');
    }

    // Parse user data if it's a string
    let users;
    if (typeof userData === 'string') {
      try {
        users = JSON.parse(userData);
      } catch (e) {
        console.error('❌ Invalid JSON format');
        return;
      }
    } else {
      users = userData;
    }

    if (!Array.isArray(users)) {
      console.error('❌ User data must be an array');
      return;
    }

    console.log(`📋 Preparing to import ${users.length} new users...`);

    // Import new users
    for (const user of users) {
      const { data: insertedUser, error: insertError } = await supabase
        .from('users')
        .insert([{
          name: user.name,
          email: user.email,
          password: user.password || '123456',
          password_changed: user.password_changed || false,
          team_id: user.team_id || null,
          location: user.location || 'Hà Nội',
          role: user.role || 'employee',
          department_type: user.department_type || 'General'
        }])
        .select()
        .single();

      if (insertError) {
        console.error(`❌ Error inserting ${user.name}:`, insertError);
      } else {
        console.log(`✅ Imported: ${user.name} (${user.email})`);
      }
    }

    // Show final count
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('count');

    if (!finalError) {
      console.log(`\n📊 Total users in database: ${finalUsers.length || 'unknown'}`);
    }

    console.log('✅ Import completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Export function for use in other scripts
module.exports = { importNewUsers };

// If run directly, show usage
if (require.main === module) {
  console.log('📖 Usage:');
  console.log('   const { importNewUsers } = require("./import-new-users.js");');
  console.log('   importNewUsers([{ name: "...", email: "...", ... }]);');
  console.log('');
  console.log('🔧 Ready to import your user data!');
  console.log('   Please provide the user data array to import.');
}
