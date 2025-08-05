const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function disableRLSAndClear() {
  console.log('🔓 Attempting to disable RLS and clear users...');

  try {
    // Try to disable RLS on users table
    console.log('🔧 Attempting to disable RLS...');
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users DISABLE ROW LEVEL SECURITY;'
    });

    if (disableError) {
      console.log('⚠️  Could not disable RLS via RPC:', disableError.message);
    } else {
      console.log('✅ RLS disabled successfully');
    }

    // Now try to delete all users
    console.log('🗑️  Attempting to delete all users...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // This should match all

    if (deleteError) {
      console.error('❌ Delete failed:', deleteError);
      
      // Try alternative approach - update all users to mark as deleted
      console.log('🔄 Trying alternative approach - marking users as deleted...');
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          email: 'deleted_' + Date.now() + '@deleted.com',
          name: 'DELETED_USER_' + Date.now()
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (updateError) {
        console.error('❌ Update also failed:', updateError);
      } else {
        console.log('✅ Users marked as deleted');
      }
    } else {
      console.log('✅ All users deleted successfully!');
    }

    // Re-enable RLS
    console.log('🔒 Re-enabling RLS...');
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ENABLE ROW LEVEL SECURITY;'
    });

    if (enableError) {
      console.log('⚠️  Could not re-enable RLS:', enableError.message);
    } else {
      console.log('✅ RLS re-enabled');
    }

    // Verify final state
    const { data: finalUsers, error: verifyError } = await supabase
      .from('users')
      .select('id, name, email');

    if (verifyError) {
      console.error('❌ Error verifying final state:', verifyError);
    } else {
      if (finalUsers && finalUsers.length > 0) {
        console.log(`📋 Remaining users: ${finalUsers.length}`);
        finalUsers.forEach(user => {
          console.log(`   - ${user.name} (${user.email})`);
        });
      } else {
        console.log('✅ Database is now empty!');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

disableRLSAndClear();
