#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testAutoPinFeature() {
  console.log('🧪 TESTING AUTO-PIN TO CALENDAR FEATURE');
  console.log('=======================================\n');
  
  try {
    // 1. Check recent tasks with scheduled_date
    console.log('📅 1. CHECKING RECENT TASKS WITH SCHEDULED_DATE:');
    console.log('================================================');
    
    const recentTasksResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&order=created_at.desc&limit=10`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const recentTasks = await recentTasksResponse.json();
    
    console.log(`Found ${recentTasks.length} recent tasks:`);
    
    let autoPinnedCount = 0;
    let manualTasksCount = 0;
    
    recentTasks.forEach((task, index) => {
      const hasScheduledDate = task.scheduled_date !== null;
      const isManualSource = task.source === 'manual';
      const createdDate = task.created_at ? task.created_at.split('T')[0] : 'N/A';
      const scheduledDate = task.scheduled_date || 'N/A';
      
      console.log(`\n${index + 1}. ${task.name}`);
      console.log(`   - ID: ${task.id}`);
      console.log(`   - Source: ${task.source || 'N/A'}`);
      console.log(`   - Created: ${createdDate}`);
      console.log(`   - Scheduled Date: ${scheduledDate}`);
      console.log(`   - Auto-pinned: ${hasScheduledDate && isManualSource ? '✅ YES' : '❌ NO'}`);
      
      if (isManualSource) {
        manualTasksCount++;
        if (hasScheduledDate) {
          autoPinnedCount++;
        }
      }
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   - Manual tasks: ${manualTasksCount}`);
    console.log(`   - Auto-pinned tasks: ${autoPinnedCount}`);
    console.log(`   - Auto-pin rate: ${manualTasksCount > 0 ? Math.round((autoPinnedCount / manualTasksCount) * 100) : 0}%`);
    
    // 2. Check today's scheduled tasks
    console.log('\n📅 2. CHECKING TODAY\'S SCHEDULED TASKS:');
    console.log('=======================================');
    
    const today = new Date().toISOString().split('T')[0];
    console.log(`Today's date: ${today}`);
    
    const todayTasksResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&scheduled_date=eq.${today}&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const todayTasks = await todayTasksResponse.json();
    
    console.log(`\nFound ${todayTasks.length} tasks scheduled for today:`);
    
    if (todayTasks.length === 0) {
      console.log('❌ No tasks found for today - this might be why you don\'t see tasks in Planning tab');
    } else {
      todayTasks.forEach((task, index) => {
        console.log(`\n${index + 1}. ${task.name}`);
        console.log(`   - Created: ${task.created_at ? task.created_at.split('T')[0] : 'N/A'}`);
        console.log(`   - Source: ${task.source || 'manual'}`);
        console.log(`   - Status: ${task.status}`);
        console.log(`   - Created by: ${task.created_by_id}`);
        console.log(`   - Assigned to: ${task.assigned_to_id}`);
      });
    }
    
    // 3. Check if auto-pin logic is working for new tasks
    console.log('\n🔍 3. ANALYZING AUTO-PIN LOGIC:');
    console.log('===============================');
    
    // Check tasks created today
    const todayCreatedResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&created_at=gte.${today}T00:00:00&created_at=lt.${today}T23:59:59&order=created_at.desc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const todayCreatedTasks = await todayCreatedResponse.json();
    
    console.log(`\nTasks created today: ${todayCreatedTasks.length}`);
    
    if (todayCreatedTasks.length === 0) {
      console.log('ℹ️  No tasks created today to test auto-pin feature');
    } else {
      let todayAutoPinned = 0;
      
      todayCreatedTasks.forEach((task, index) => {
        const isAutoPinned = task.scheduled_date === today && task.source === 'manual';
        
        console.log(`\n${index + 1}. ${task.name}`);
        console.log(`   - Created at: ${task.created_at}`);
        console.log(`   - Scheduled date: ${task.scheduled_date || 'None'}`);
        console.log(`   - Source: ${task.source || 'manual'}`);
        console.log(`   - Auto-pinned: ${isAutoPinned ? '✅ YES' : '❌ NO'}`);
        
        if (isAutoPinned) todayAutoPinned++;
      });
      
      console.log(`\n📊 Today's auto-pin results:`);
      console.log(`   - Tasks created: ${todayCreatedTasks.length}`);
      console.log(`   - Auto-pinned: ${todayAutoPinned}`);
      console.log(`   - Success rate: ${Math.round((todayAutoPinned / todayCreatedTasks.length) * 100)}%`);
    }
    
    // 4. Recommendations
    console.log('\n💡 4. TROUBLESHOOTING RECOMMENDATIONS:');
    console.log('=====================================');
    
    if (autoPinnedCount === 0) {
      console.log('❌ ISSUE: No auto-pinned tasks found');
      console.log('   Possible causes:');
      console.log('   1. Auto-pin feature is disabled in UI');
      console.log('   2. Logic error in taskService.createTask()');
      console.log('   3. Database constraint preventing scheduled_date');
      console.log('   4. Frontend not passing autoPinToCalendar=true');
    } else {
      console.log('✅ Auto-pin feature is working for some tasks');
    }
    
    if (todayTasks.length === 0) {
      console.log('\n❌ ISSUE: No tasks scheduled for today');
      console.log('   Solutions:');
      console.log('   1. Create a new task with auto-pin enabled');
      console.log('   2. Check if tasks are being created with correct date');
      console.log('   3. Verify PlanningTab is querying correct date');
    } else {
      console.log('\n✅ Tasks are scheduled for today - should appear in Planning tab');
    }
    
    // 5. Quick test suggestion
    console.log('\n🧪 5. QUICK TEST SUGGESTION:');
    console.log('============================');
    console.log('To test auto-pin feature:');
    console.log('1. Go to TaskList → Create new task');
    console.log('2. Ensure "Ghim vào Lịch Kế Hoạch" toggle is ON (default)');
    console.log('3. Create the task');
    console.log('4. Check Menu Kế Hoạch → Today\'s date');
    console.log('5. Task should appear in the planning view');
    
    console.log('\n🔍 Debug query for today\'s tasks:');
    console.log(`SELECT * FROM tasks WHERE scheduled_date = '${today}';`);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAutoPinFeature();
