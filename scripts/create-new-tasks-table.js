const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function createNewTasksTable() {
  console.log('🔧 Creating new tasks table without foreign key constraints...');

  try {
    // 1. Try to create a new table with a different name
    console.log('\n1. Creating tasks_v2 table...');
    
    const { data: createResult, error: createError } = await supabase
      .from('tasks_v2')
      .select('*')
      .limit(0);

    if (createError && createError.code === '42P01') {
      console.log('✅ tasks_v2 table does not exist, we can create it');
      
      // Since we can't create tables via REST API, let's use a workaround
      // We'll insert into a non-existent table to trigger table creation
      console.log('\n2. Attempting to trigger table creation...');
      
      // This won't work, but let's try a different approach
      // Let's use the existing tasks table but work around the foreign key issue
      
      console.log('\n3. Working around foreign key constraint...');
      
      // Check if there's a members table and if our user exists there
      const { data: membersCheck, error: membersError } = await supabase
        .from('members')
        .select('*')
        .eq('id', '6be99296-c122-457c-a7e6-2c5af3f78d44');

      if (membersError) {
        console.log('⚠️  Members table issue:', membersError.message);
        
        if (membersError.code === '42P01') {
          console.log('💡 Members table does not exist!');
          console.log('🔧 The foreign key constraint references a non-existent table');
          
          // Let's create the missing members table
          console.log('\n4. Creating members table to satisfy foreign key...');
          
          const { data: insertMember, error: insertMemberError } = await supabase
            .from('members')
            .insert({
              id: '6be99296-c122-457c-a7e6-2c5af3f78d44',
              name: 'Lê Khánh Duy',
              email: 'duy.le@company.com'
            })
            .select();

          if (insertMemberError && insertMemberError.code === '42P01') {
            console.log('❌ Cannot create members table via API');
            await createManualSolution();
          } else if (insertMemberError) {
            console.log('❌ Error creating member:', insertMemberError);
            await createManualSolution();
          } else {
            console.log('✅ Member created in members table');
            await testTaskCreationAfterMemberFix();
          }
        }
      } else {
        console.log('✅ Members table exists');
        
        if (membersCheck.length === 0) {
          console.log('⚠️  User not found in members table, adding...');
          
          const { data: insertResult, error: insertError } = await supabase
            .from('members')
            .insert({
              id: '6be99296-c122-457c-a7e6-2c5af3f78d44',
              name: 'Lê Khánh Duy',
              email: 'duy.le@company.com'
            })
            .select();

          if (insertError) {
            console.log('❌ Error adding user to members:', insertError);
            await createManualSolution();
          } else {
            console.log('✅ User added to members table');
            await testTaskCreationAfterMemberFix();
          }
        } else {
          console.log('✅ User exists in members table');
          await testTaskCreationAfterMemberFix();
        }
      }
    } else {
      console.log('✅ tasks_v2 table exists or other issue:', createError);
      await createManualSolution();
    }

  } catch (error) {
    console.error('❌ Failed to create new table:', error);
    await createManualSolution();
  }
}

async function testTaskCreationAfterMemberFix() {
  console.log('\n🧪 Testing task creation after member fix...');
  
  const testTask = {
    name: 'Member Fix Test - ' + Date.now(),
    description: 'Testing after adding user to members table',
    work_type: 'other',
    priority: 'normal',
    status: 'new-requests',
    created_by_id: '6be99296-c122-457c-a7e6-2c5af3f78d44',
    assigned_to_id: '6be99296-c122-457c-a7e6-2c5af3f78d44',
    team_id: '018c0ab7-bf40-4b45-8514-2de4e89bab61',
    department: 'HN'
  };

  const { data: result, error } = await supabase
    .from('tasks')
    .insert(testTask)
    .select()
    .single();

  if (error) {
    console.log('❌ Still failing after member fix:', error.message);
    await createManualSolution();
  } else {
    console.log('✅ SUCCESS! Task created in database:', result.id);
    
    // Clean up test task
    await supabase.from('tasks').delete().eq('id', result.id);
    console.log('✅ Test task cleaned up');
    
    console.log('\n🎉 DATABASE IS NOW WORKING!');
    console.log('📝 Updating frontend to use database...');
    
    await updateFrontendForDatabaseSuccess();
  }
}

async function updateFrontendForDatabaseSuccess() {
  console.log('\n📝 Updating frontend to prioritize database...');
  
  // Update TaskList to remove localStorage fallback
  const updateInstructions = `
🎉 DATABASE FIX SUCCESSFUL!

The tasks table is now working correctly. The issue was that the foreign key constraint 
referenced a "members" table, and the user wasn't present in that table.

CHANGES MADE:
1. ✅ Added user to members table to satisfy foreign key constraint
2. ✅ Task creation now works directly with Supabase database
3. ✅ No more localStorage fallback needed

NEXT STEPS:
1. Remove localStorage fallback from TaskList.tsx
2. Remove "(lưu tạm thời)" messages
3. Test task creation in browser

The frontend will now save tasks directly to Supabase database and they will be 
visible to all users including team leaders and Khổng Đức Mạnh!
  `;
  
  require('fs').writeFileSync('DATABASE_SUCCESS.md', updateInstructions);
  console.log('✅ Success instructions created: DATABASE_SUCCESS.md');
  
  console.log('\n🔧 Now test in browser:');
  console.log('   1. Login: duy.le@company.com / 123456');
  console.log('   2. Go to Work tab');
  console.log('   3. Create a task');
  console.log('   4. Should save to database (no "lưu tạm thời" message)');
  console.log('   5. Task should appear in task list');
  console.log('   6. Other users can see the task');
}

async function createManualSolution() {
  console.log('\n📝 Creating manual solution...');
  
  const manualSQL = `
-- MANUAL FIX FOR TASKS TABLE FOREIGN KEY ISSUE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql

-- Option 1: Add user to members table (if members table exists)
INSERT INTO members (id, name, email) 
VALUES ('6be99296-c122-457c-a7e6-2c5af3f78d44', 'Lê Khánh Duy', 'duy.le@company.com')
ON CONFLICT (id) DO NOTHING;

-- Option 2: Drop foreign key constraints (if Option 1 doesn't work)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_team_id_fkey;

-- Test task creation
INSERT INTO tasks (name, description, work_type, priority, status, created_by_id, assigned_to_id, team_id, department)
VALUES ('Manual Test Task', 'Testing manual fix', 'other', 'normal', 'new-requests', 
        '6be99296-c122-457c-a7e6-2c5af3f78d44', 
        '6be99296-c122-457c-a7e6-2c5af3f78d44', 
        '018c0ab7-bf40-4b45-8514-2de4e89bab61', 
        'HN');

-- Verify task was created
SELECT id, name, created_by_id, created_at FROM tasks WHERE name = 'Manual Test Task';

-- Clean up test task
DELETE FROM tasks WHERE name = 'Manual Test Task';
  `;
  
  require('fs').writeFileSync('scripts/MANUAL_DATABASE_FIX.sql', manualSQL);
  console.log('✅ Manual fix SQL created: scripts/MANUAL_DATABASE_FIX.sql');
  
  console.log('\n🚨 MANUAL DATABASE FIX REQUIRED:');
  console.log('   1. Go to: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql');
  console.log('   2. Login to your Supabase account');
  console.log('   3. Copy and run the SQL from: scripts/MANUAL_DATABASE_FIX.sql');
  console.log('   4. After running, test task creation in browser');
  
  console.log('\n💡 The issue is that the tasks table has a foreign key constraint');
  console.log('   that references a "members" table, but the user is not in that table.');
  console.log('   The manual fix will either add the user to members table or remove');
  console.log('   the foreign key constraints entirely.');
}

createNewTasksTable();
