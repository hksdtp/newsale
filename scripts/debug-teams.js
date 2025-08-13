#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function debugTeamsData() {
  console.log('🔍 Debugging teams and users data...');
  
  try {
    // 1. Check all teams
    console.log('\n📋 ALL TEAMS:');
    const teamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const teamsData = await teamsResponse.json();
    if (Array.isArray(teamsData)) {
      teamsData.forEach(team => {
        console.log(`   - ID: ${team.id}, Name: ${team.name}, Location: ${team.location}`);
      });
    } else {
      console.log('   Error:', teamsData);
    }
    
    // 2. Check all users
    console.log('\n👥 ALL USERS:');
    const usersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,location,team_id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const usersData = await usersResponse.json();
    if (Array.isArray(usersData)) {
      usersData.forEach(user => {
        console.log(`   - ${user.name}, Location: ${user.location}, Team ID: ${user.team_id}`);
      });
    } else {
      console.log('   Error:', usersData);
    }
    
    // 3. Check users in "Hà Nội" location
    console.log('\n🏢 USERS IN "Hà Nội":');
    const hanoiUsersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,name,location,team_id&location=eq.Hà Nội`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const hanoiUsersData = await hanoiUsersResponse.json();
    if (Array.isArray(hanoiUsersData)) {
      console.log(`   Found ${hanoiUsersData.length} users in Hà Nội:`);
      hanoiUsersData.forEach(user => {
        console.log(`   - ${user.name}, Team ID: ${user.team_id}`);
      });
      
      // Get unique team IDs
      const teamIds = [...new Set(hanoiUsersData.map(user => user.team_id))].filter(Boolean);
      console.log(`   Unique team IDs: ${teamIds.join(', ')}`);
      
      if (teamIds.length > 0) {
        // Get teams by these IDs
        console.log('\n🎯 TEAMS FOR HANOI USERS:');
        const teamsByIdsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=in.(${teamIds.join(',')})`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        
        const teamsByIdsData = await teamsByIdsResponse.json();
        if (Array.isArray(teamsByIdsData)) {
          teamsByIdsData.forEach(team => {
            console.log(`   - ${team.name} (ID: ${team.id})`);
          });
        } else {
          console.log('   Error:', teamsByIdsData);
        }
      }
    } else {
      console.log('   Error:', hanoiUsersData);
    }
    
    // 4. Check teams with location "HN"
    console.log('\n🏢 TEAMS WITH LOCATION "HN":');
    const hnTeamsResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&location=eq.HN`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const hnTeamsData = await hnTeamsResponse.json();
    if (Array.isArray(hnTeamsData)) {
      console.log(`   Found ${hnTeamsData.length} teams with location HN:`);
      hnTeamsData.forEach(team => {
        console.log(`   - ${team.name} (ID: ${team.id})`);
      });
    } else {
      console.log('   Error:', hnTeamsData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugTeamsData();
