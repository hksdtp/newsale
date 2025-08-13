#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function checkTeamsStructure() {
  console.log('🔍 Checking teams table structure...');
  
  try {
    // Get teams by the IDs we found
    const teamIds = [
      '018c0ab7-bf40-4b45-8514-2de4e89bab61',
      'f272c91c-aad2-4b46-931a-91f186ec3e7d', 
      'f4d83b0b-ad26-4ad4-90c7-38ea87889bbd',
      'b082cb9a-e620-478b-b9f0-d170175cbfef',
      '6bbaa4b0-a2fb-4984-8756-1a36ed2cc8fc'
    ];
    
    console.log('\n📋 TEAMS FOR HANOI USERS:');
    const teamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=in.(${teamIds.join(',')})`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const teamsData = await teamsResponse.json();
    
    if (Array.isArray(teamsData)) {
      console.log(`✅ Found ${teamsData.length} teams:`);
      teamsData.forEach((team, index) => {
        console.log(`   ${index + 1}. ${team.name} (ID: ${team.id})`);
        console.log(`      Columns: ${Object.keys(team).join(', ')}`);
      });
      
      if (teamsData.length > 0) {
        console.log('\n📊 Sample team structure:');
        console.log(JSON.stringify(teamsData[0], null, 2));
      }
    } else {
      console.log('❌ Error:', teamsData);
    }
    
    // Test the authService logic manually
    console.log('\n🧪 Testing authService logic manually:');
    
    // Step 1: Get users by location
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=team_id,name,role&location=eq.Hà Nội`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const usersData = await usersResponse.json();
    console.log(`   Step 1: Found ${usersData.length} users in Hà Nội`);
    
    // Step 2: Get unique team IDs
    const uniqueTeamIds = [...new Set(usersData.map(user => user.team_id))].filter(Boolean);
    console.log(`   Step 2: Unique team IDs: ${uniqueTeamIds.length}`);
    
    // Step 3: Get teams by IDs
    if (uniqueTeamIds.length > 0) {
      const finalTeamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=id,name&id=in.(${uniqueTeamIds.join(',')})`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      const finalTeamsData = await finalTeamsResponse.json();
      console.log(`   Step 3: Final teams result: ${finalTeamsData.length} teams`);
      
      if (Array.isArray(finalTeamsData)) {
        finalTeamsData.forEach(team => {
          const teamLeader = usersData.find(user => 
            user.team_id === team.id && user.role === 'team_leader'
          );
          console.log(`      - ${team.name} (Leader: ${teamLeader?.name || 'None'})`);
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkTeamsStructure();
