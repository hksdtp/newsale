const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceClearUsers() {
  console.log('🗑️  Force clearing all users...');

  try {
    // Try to truncate the table (this bypasses RLS)
    const { error: truncateError } = await supabase.rpc('truncate_users_table');
    
    if (truncateError) {
      console.log('⚠️  Truncate function not available, trying direct delete...');
      
      // Alternative: Delete with a condition that matches all records
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .gte('created_at', '1900-01-01'); // This should match all records
        
      if (deleteError) {
        console.error('❌ Error with direct delete:', deleteError);
        
        // Last resort: Try to delete specific IDs
        const userIds = [
          '00d7519b-3726-43cb-a4ce-cc3495506b1f',
          '2a11e3b5-4188-4b77-97f3-1c9f87fc09ee', 
          '23bdd098-476b-45c1-8b09-5109247f4200',
          '288192b4-d628-4296-bb31-bbb609443aba',
          'f4756a6b-a722-4dba-a410-75abea11d61d',
          '8ed7c419-711e-4325-90c5-225e985e0ecb'
        ];
        
        console.log('🎯 Trying to delete by specific IDs...');
        for (const id of userIds) {
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);
            
          if (error) {
            console.error(`❌ Failed to delete ${id}:`, error);
          } else {
            console.log(`✅ Deleted user ${id}`);
          }
        }
      } else {
        console.log('✅ Direct delete successful!');
      }
    } else {
      console.log('✅ Truncate successful!');
    }

    // Verify deletion
    const { data: remainingUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email');

    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError);
      return;
    }

    if (remainingUsers && remainingUsers.length > 0) {
      console.log(`⚠️  Still ${remainingUsers.length} users remaining:`);
      remainingUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.email})`);
      });
    } else {
      console.log('✅ Database is now completely empty!');
    }

    console.log('📤 Ready for new user data!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

forceClearUsers();
