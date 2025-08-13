#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function checkTasksSchema() {
  console.log('🔍 Checking tasks table schema...\n');
  
  try {
    // Lấy tất cả tasks để xem schema
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&limit=5`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const tasks = await response.json();
    
    if (Array.isArray(tasks) && tasks.length > 0) {
      console.log(`✅ Found ${tasks.length} tasks in database`);
      console.log('\n📋 TASK SCHEMA:');
      
      const sampleTask = tasks[0];
      Object.keys(sampleTask).forEach(key => {
        const value = sampleTask[key];
        const type = value === null ? 'null' : typeof value;
        console.log(`   ${key}: ${type} = ${value}`);
      });
      
      // Kiểm tra các cột cần thiết cho scheduling
      const requiredColumns = ['scheduled_date', 'scheduled_time', 'source'];
      console.log('\n🔍 CHECKING SCHEDULING COLUMNS:');
      
      requiredColumns.forEach(col => {
        if (col in sampleTask) {
          console.log(`✅ ${col}: exists`);
        } else {
          console.log(`❌ ${col}: missing`);
        }
      });
      
      // Tìm tasks có scheduled_date
      console.log('\n📅 SCHEDULED TASKS:');
      const scheduledTasks = tasks.filter(task => task.scheduled_date);
      
      if (scheduledTasks.length > 0) {
        console.log(`✅ Found ${scheduledTasks.length} scheduled tasks:`);
        scheduledTasks.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.name}`);
          console.log(`      - Scheduled Date: ${task.scheduled_date}`);
          console.log(`      - Scheduled Time: ${task.scheduled_time || 'No time'}`);
          console.log(`      - Source: ${task.source || 'unknown'}`);
        });
      } else {
        console.log('❌ No scheduled tasks found');
        console.log('💡 Try creating some plans in the Planning tab');
      }
      
    } else {
      console.log('❌ No tasks found in database');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkTasksSchema();
