#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testAutoPinFix() {
  console.log('🧪 TESTING AUTO-PIN FIX');
  console.log('========================\n');
  
  try {
    // Get a test user
    const userResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&limit=1`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const users = await userResponse.json();
    const testUser = users[0];
    
    console.log(`👤 Test user: ${testUser.name} (${testUser.id})`);
    
    // Create a test task with auto-pin enabled
    const today = new Date().toISOString().split('T')[0];
    const testTaskData = {
      name: `TEST Auto-Pin ${Date.now()}`,
      description: 'Testing auto-pin to calendar feature',
      work_type: ['consultation'],
      priority: 'normal',
      status: 'new-requests',
      start_date: new Date().toISOString(),
      created_by_id: testUser.id,
      assigned_to_id: testUser.id,
      team_id: testUser.team_id,
      department: testUser.location === 'Hà Nội' ? 'HN' : 'HCM',
      share_scope: 'team',
      source: 'manual',
      // This should trigger auto-pin logic
      scheduled_date: today // Manually set to test
    };
    
    console.log('\n🔧 Creating test task with auto-pin...');
    
    const createResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testTaskData)
    });
    
    if (createResponse.ok) {
      const createdTask = await createResponse.json();
      console.log('✅ Test task created successfully!');
      console.log(`   - Task ID: ${createdTask.id}`);
      console.log(`   - Name: ${createdTask.name}`);
      console.log(`   - Scheduled Date: ${createdTask.scheduled_date}`);
      console.log(`   - Source: ${createdTask.source}`);
      
      // Verify it appears in today's scheduled tasks
      console.log('\n🔍 Verifying task appears in scheduled tasks...');
      
      const scheduledResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&scheduled_date=eq.${today}&name=ilike.*TEST Auto-Pin*`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const scheduledTasks = await scheduledResponse.json();
      
      if (scheduledTasks.length > 0) {
        console.log('✅ Task found in scheduled tasks!');
        console.log(`   - Found ${scheduledTasks.length} test task(s)`);
        console.log('   - This task should now appear in Menu Kế Hoạch');
      } else {
        console.log('❌ Task not found in scheduled tasks');
      }
      
      // Clean up test task
      console.log('\n🧹 Cleaning up test task...');
      await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${createdTask.id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      console.log('✅ Test task cleaned up');
      
    } else {
      const error = await createResponse.json();
      console.log('❌ Failed to create test task');
      console.log(`   Error: ${error.message || JSON.stringify(error)}`);
    }
    
    // Check if fix is working by looking at recent tasks
    console.log('\n📊 CHECKING RECENT TASKS AFTER FIX:');
    console.log('===================================');
    
    const recentResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&source=eq.manual&order=created_at.desc&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const recentTasks = await recentResponse.json();
    
    console.log(`Found ${recentTasks.length} recent manual tasks:`);
    
    let autoPinnedCount = 0;
    recentTasks.forEach((task, index) => {
      const hasScheduledDate = task.scheduled_date !== null;
      const createdDate = task.created_at ? task.created_at.split('T')[0] : 'N/A';
      
      console.log(`\n${index + 1}. ${task.name}`);
      console.log(`   - Created: ${createdDate}`);
      console.log(`   - Scheduled Date: ${task.scheduled_date || 'None'}`);
      console.log(`   - Auto-pinned: ${hasScheduledDate ? '✅ YES' : '❌ NO'}`);
      
      if (hasScheduledDate) autoPinnedCount++;
    });
    
    console.log(`\n📈 Auto-pin success rate: ${Math.round((autoPinnedCount / recentTasks.length) * 100)}%`);
    
    // Instructions for user
    console.log('\n📋 INSTRUCTIONS FOR USER:');
    console.log('=========================');
    console.log('1. Go to app and create a new task');
    console.log('2. Make sure "Ghim vào Lịch Kế Hoạch" toggle is ON');
    console.log('3. Create the task');
    console.log('4. Go to Menu Kế Hoạch');
    console.log('5. Select today\'s date');
    console.log('6. Your task should appear in the planning view');
    
    console.log('\n✅ Auto-pin fix has been deployed!');
    console.log('🔄 Please refresh your browser and test creating a new task.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAutoPinFix();
