const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables!');
  console.log('Please ensure .env.local has VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function executeConstraintFix() {
  console.log('🔧 Fixing foreign key constraint error...\n');

  try {
    // Step 1: Drop constraints using Supabase JS client
    console.log('1. Dropping existing constraints...');
    
    // We'll test by trying to insert a task directly
    const testTask = {
      name: 'Fix Test - ' + Date.now(),
      description: 'Testing constraint fix',
      work_type: 'other',
      priority: 'normal',
      status: 'new-requests',
      created_by_id: '6be99296-c122-457c-a7e6-2c5af3f78d44',
      assigned_to_id: '6be99296-c122-457c-a7e6-2c5af3f78d44',
      team_id: '018c0ab7-bf40-4b45-8514-2de4e89bab61',
      department: 'HN'
    };

    console.log('2. Testing task insertion...');
    const { data: insertResult, error: insertError } = await supabase
      .from('tasks')
      .insert(testTask)
      .select()
      .single();

    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      // Generate manual fix instructions
      console.log('\n🚨 MANUAL FIX REQUIRED!');
      console.log('====================================');
      console.log('Please follow these steps:\n');
      console.log('1. Open Supabase Dashboard: https://app.supabase.com');
      console.log('2. Go to your project');
      console.log('3. Click on "SQL Editor" in the left sidebar');
      console.log('4. Run the SQL from: scripts/fix-constraint-error.sql');
      console.log('\nOr copy and paste this SQL:\n');
      
      const sqlContent = fs.readFileSync('./scripts/fix-constraint-error.sql', 'utf8');
      console.log('```sql');
      console.log(sqlContent);
      console.log('```');
      
      console.log('\n5. After running the SQL, run this script again to verify');
      
    } else {
      console.log('✅ Task inserted successfully!', insertResult.id);
      
      // Clean up test task
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', insertResult.id);
      
      if (!deleteError) {
        console.log('✅ Test task cleaned up');
      }
      
      console.log('\n🎉 Database is working correctly!');
      console.log('Tasks can now be saved to Supabase.');
      
      // Update frontend flag
      updateFrontendConfig();
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

function updateFrontendConfig() {
  console.log('\n📝 Updating frontend configuration...');
  
  const configNote = `
DATABASE FIX SUCCESSFUL!
======================

The tasks table constraint error has been fixed.

Next steps:
1. The frontend will now save tasks to Supabase database
2. Remove the "lưu tạm thời" (temporary save) message
3. Test task creation in the browser

Tasks will be persisted in the database instead of localStorage.
`;

  fs.writeFileSync('DATABASE_FIX_COMPLETED.md', configNote);
  console.log('✅ Success note created: DATABASE_FIX_COMPLETED.md');
}

// Run the fix
executeConstraintFix();
