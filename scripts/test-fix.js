#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testDataAccess() {
  console.log('🧪 Testing data access after fix...');
  
  try {
    // Test tasks access
    const tasksResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=id,name&limit=3`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const tasksData = await tasksResponse.json();
    
    if (Array.isArray(tasksData)) {
      console.log(`✅ Tasks accessible: ${tasksData.length} tasks found`);
    } else if (tasksData.error) {
      console.log(`❌ Tasks blocked: ${tasksData.error.message}`);
    }
    
    // Test teams/users access
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,team_id&limit=3`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const usersData = await usersResponse.json();
    
    if (Array.isArray(usersData)) {
      console.log(`✅ Users accessible: ${usersData.length} users found`);
    } else if (usersData.error) {
      console.log(`❌ Users blocked: ${usersData.error.message}`);
    }
    
  } catch (error) {
    console.error('Error testing:', error);
  }
}

testDataAccess();
