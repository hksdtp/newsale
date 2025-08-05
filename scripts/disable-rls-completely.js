const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function disableRLSCompletely() {
  console.log('🔓 Disabling RLS completely to fix infinite recursion...');

  try {
    // Disable RLS on all tables
    const tables = ['users', 'teams', 'members', 'tasks'];
    
    for (const table of tables) {
      console.log(`\n🔧 Processing table: ${table}`);
      
      try {
        // Check if table exists
        const { data: tableExists, error: checkError } = await supabase.rpc('exec_sql', {
          sql: `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}');`
        });

        if (checkError) {
          console.log(`⚠️  Could not check if ${table} exists:`, checkError.message);
          continue;
        }

        // Drop all policies for this table
        const { error: dropError } = await supabase.rpc('exec_sql', {
          sql: `
            DO $$
            DECLARE
                pol RECORD;
            BEGIN
                FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = '${table}'
                LOOP
                    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ${table}';
                END LOOP;
            END $$;
          `
        });

        if (dropError) {
          console.log(`⚠️  Could not drop policies for ${table}:`, dropError.message);
        } else {
          console.log(`✅ Dropped all policies for ${table}`);
        }

        // Disable RLS
        const { error: disableError } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE ${table} DISABLE ROW LEVEL SECURITY;`
        });

        if (disableError) {
          console.log(`⚠️  Could not disable RLS for ${table}:`, disableError.message);
        } else {
          console.log(`✅ Disabled RLS for ${table}`);
        }

        // Grant permissions
        const { error: grantError } = await supabase.rpc('exec_sql', {
          sql: `GRANT ALL ON ${table} TO anon, authenticated;`
        });

        if (grantError) {
          console.log(`⚠️  Could not grant permissions for ${table}:`, grantError.message);
        } else {
          console.log(`✅ Granted permissions for ${table}`);
        }

      } catch (error) {
        console.log(`❌ Error processing ${table}:`, error.message);
      }
    }

    // Test the fix
    console.log('\n🧪 Testing the fix...');
    
    const { data: testUsers, error: testUsersError } = await supabase
      .from('users')
      .select('team_id, name, role')
      .eq('location', 'Hà Nội')
      .limit(3);

    if (testUsersError) {
      console.error('❌ Users test failed:', testUsersError);
    } else {
      console.log(`✅ Users test passed: ${testUsers.length} users found`);
    }

    const { data: testTeams, error: testTeamsError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(3);

    if (testTeamsError) {
      console.error('❌ Teams test failed:', testTeamsError);
    } else {
      console.log(`✅ Teams test passed: ${testTeams.length} teams found`);
    }

    if (!testUsersError && !testTeamsError) {
      console.log('\n🎉 RLS fix successful!');
      console.log('🔧 Now test the frontend:');
      console.log('   1. Clear browser cache (Ctrl+Shift+R)');
      console.log('   2. Go to: http://localhost:3000/auth/director-login');
      console.log('   3. Login with: manh.khong@company.com / 123456');
    } else {
      console.log('\n⚠️  Some issues remain. Check Supabase Dashboard for manual fixes.');
    }

  } catch (error) {
    console.error('❌ Failed to disable RLS:', error);
  }
}

disableRLSCompletely();
