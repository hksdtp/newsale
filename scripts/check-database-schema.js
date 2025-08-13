#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');
  
  const tables = [
    'tasks',
    'scheduled_tasks', 
    'users',
    'teams',
    'planning',
    'schedules'
  ];
  
  for (const table of tables) {
    try {
      console.log(`📋 Checking table: ${table}`);
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&limit=1`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Table '${table}' exists - ${Array.isArray(data) ? data.length : 0} records found`);
        
        if (Array.isArray(data) && data.length > 0) {
          console.log(`   Sample columns:`, Object.keys(data[0]).slice(0, 5).join(', '));
        }
      } else {
        console.log(`❌ Table '${table}' not found or no access (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
    }
    console.log('');
  }
}

checkSchema();
