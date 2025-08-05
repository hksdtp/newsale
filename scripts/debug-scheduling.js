#!/usr/bin/env node

/**
 * 🔍 DEBUG SCHEDULING SYSTEM
 * Check why scheduled tasks don't appear in Planning menu
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

console.log('🔍 Debugging Scheduling System');
console.log('==============================\n');

async function checkScheduledTasks() {
  console.log('📊 Checking all tasks with scheduled_date...');
  
  try {
    // Get all tasks with scheduled_date
    const { data: allTasks, error: allError } = await supabase
      .from('tasks')
      .select('id, name, scheduled_date, scheduled_time, source, created_by_id, assigned_to_id')
      .not('scheduled_date', 'is', null)
      .order('scheduled_date');
    
    if (allError) {
      console.log('❌ Error getting all scheduled tasks:', allError.message);
      return false;
    }
    
    console.log(`✅ Found ${allTasks?.length || 0} tasks with scheduled_date:`);
    
    if (allTasks && allTasks.length > 0) {
      allTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.name}`);
        console.log(`      📅 Date: ${task.scheduled_date}`);
        console.log(`      🕐 Time: ${task.scheduled_time || 'No time'}`);
        console.log(`      📝 Source: ${task.source || 'No source'}`);
        console.log(`      👤 Created by: ${task.created_by_id || 'Unknown'}`);
        console.log(`      👥 Assigned to: ${task.assigned_to_id || 'Unassigned'}`);
        console.log('');
      });
    } else {
      console.log('   📝 No scheduled tasks found in database');
    }
    
    return true;
  } catch (err) {
    console.log('❌ Error checking scheduled tasks:', err.message);
    return false;
  }
}

async function checkTodayTasks() {
  console.log('📅 Checking tasks scheduled for today...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: todayTasks, error: todayError } = await supabase
      .from('tasks')
      .select('*')
      .eq('scheduled_date', today)
      .order('scheduled_time');
    
    if (todayError) {
      console.log('❌ Error getting today tasks:', todayError.message);
      return false;
    }
    
    console.log(`✅ Found ${todayTasks?.length || 0} tasks scheduled for today (${today}):`);
    
    if (todayTasks && todayTasks.length > 0) {
      todayTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.name} at ${task.scheduled_time || 'no time'}`);
      });
    }
    
    return true;
  } catch (err) {
    console.log('❌ Error checking today tasks:', err.message);
    return false;
  }
}

async function checkRecentTasks() {
  console.log('🔍 Checking recently created/updated tasks...');
  
  try {
    const { data: recentTasks, error: recentError } = await supabase
      .from('tasks')
      .select('id, name, scheduled_date, scheduled_time, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      console.log('❌ Error getting recent tasks:', recentError.message);
      return false;
    }
    
    console.log(`✅ Last 10 updated tasks:`);
    
    if (recentTasks && recentTasks.length > 0) {
      recentTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.name}`);
        console.log(`      📅 Scheduled: ${task.scheduled_date || 'Not scheduled'}`);
        console.log(`      🕐 Time: ${task.scheduled_time || 'No time'}`);
        console.log(`      📝 Updated: ${task.updated_at}`);
        console.log('');
      });
    }
    
    return true;
  } catch (err) {
    console.log('❌ Error checking recent tasks:', err.message);
    return false;
  }
}

async function testScheduleTask() {
  console.log('🧪 Testing task scheduling...');
  
  try {
    // Get a task to schedule
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('id, name, scheduled_date')
      .is('scheduled_date', null)
      .limit(1);
    
    if (taskError || !tasks || tasks.length === 0) {
      console.log('⚠️  No unscheduled tasks found for testing');
      return false;
    }
    
    const testTask = tasks[0];
    console.log(`   Using task: ${testTask.name}`);
    
    // Schedule for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const { data: scheduledTask, error: scheduleError } = await supabase
      .from('tasks')
      .update({
        scheduled_date: tomorrowStr,
        scheduled_time: '10:00:00',
        source: 'manual'
      })
      .eq('id', testTask.id)
      .select()
      .single();
    
    if (scheduleError) {
      console.log('❌ Error scheduling test task:', scheduleError.message);
      return false;
    }
    
    console.log('✅ Test task scheduled successfully:');
    console.log(`   📅 Date: ${scheduledTask.scheduled_date}`);
    console.log(`   🕐 Time: ${scheduledTask.scheduled_time}`);
    console.log(`   📝 Source: ${scheduledTask.source}`);
    
    return true;
  } catch (err) {
    console.log('❌ Error testing task scheduling:', err.message);
    return false;
  }
}

async function main() {
  const scheduledCheck = await checkScheduledTasks();
  const todayCheck = await checkTodayTasks();
  const recentCheck = await checkRecentTasks();
  const testSchedule = await testScheduleTask();
  
  console.log('\n📋 Scheduling Debug Results:');
  console.log('============================');
  console.log(`Scheduled Tasks Check: ${scheduledCheck ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Today Tasks Check: ${todayCheck ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Recent Tasks Check: ${recentCheck ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Test Scheduling: ${testSchedule ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (scheduledCheck && todayCheck && recentCheck) {
    console.log('\n🎯 Debugging Summary:');
    console.log('- Database has scheduled tasks data');
    console.log('- Queries are working correctly');
    console.log('- Issue might be in frontend components');
    
    console.log('\n🔧 Next Steps:');
    console.log('1. Check browser console for errors');
    console.log('2. Verify PlanningTab is calling correct API');
    console.log('3. Check if TaskScheduling saves to database');
    console.log('4. Test refresh after scheduling');
  } else {
    console.log('\n⚠️  Database or API issues detected');
    console.log('Check the errors above for details');
  }
}

main().catch(console.error);
