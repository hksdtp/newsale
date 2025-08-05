const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Use ANON key like the frontend does
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugTeamAPI() {
  console.log('🔍 Debugging Team API with ANON key (like frontend)...');

  try {
    // Test exactly what the frontend calls
    console.log('\n1. Testing with "Hà Nội"...');
    
    const { data: hanoiUsers, error: usersError } = await supabase
      .from('users')
      .select('team_id, name, role')
      .eq('location', 'Hà Nội');

    console.log('Raw users response:', { data: hanoiUsers, error: usersError });

    if (usersError) {
      console.error('❌ Error getting users:', usersError);
      return;
    }

    if (!hanoiUsers || hanoiUsers.length === 0) {
      console.log('❌ No users found for location "Hà Nội"');
      
      // Check what locations exist
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('location, name')
        .order('location');
      
      if (!allError && allUsers) {
        console.log('\n📍 All locations in database:');
        const locations = [...new Set(allUsers.map(u => u.location))];
        locations.forEach(loc => {
          const count = allUsers.filter(u => u.location === loc).length;
          console.log(`   - "${loc}" (${count} users)`);
        });
      }
      return;
    }

    console.log(`✅ Found ${hanoiUsers.length} users in Hà Nội`);

    // Get unique team IDs
    const teamIds = [...new Set(hanoiUsers.map(user => user.team_id))].filter(Boolean);
    console.log('Team IDs:', teamIds);

    if (teamIds.length === 0) {
      console.log('❌ No team IDs found');
      return;
    }

    // Get teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .in('id', teamIds)
      .order('name');

    console.log('Raw teams response:', { data: teams, error: teamsError });

    if (teamsError) {
      console.error('❌ Error getting teams:', teamsError);
      return;
    }

    if (!teams || teams.length === 0) {
      console.log('❌ No teams found for team IDs');
      return;
    }

    // Add leader info
    const teamsWithLeaders = teams.map(team => {
      const teamLeader = hanoiUsers.find(user =>
        user.team_id === team.id && user.role === 'team_leader'
      );

      return {
        ...team,
        leader_name: teamLeader?.name || null
      };
    });

    console.log('\n✅ Final teams with leaders:');
    teamsWithLeaders.forEach(team => {
      console.log(`   - ${team.name} (Leader: ${team.leader_name})`);
    });

    // Test 2: TP.HCM
    console.log('\n2. Testing with "Hồ Chí Minh"...');
    
    const { data: hcmUsers, error: hcmUsersError } = await supabase
      .from('users')
      .select('team_id, name, role')
      .eq('location', 'Hồ Chí Minh');

    console.log('HCM users response:', { data: hcmUsers, error: hcmUsersError });

    if (hcmUsersError) {
      console.error('❌ Error getting HCM users:', hcmUsersError);
      return;
    }

    if (!hcmUsers || hcmUsers.length === 0) {
      console.log('❌ No users found for location "Hồ Chí Minh"');
      return;
    }

    console.log(`✅ Found ${hcmUsers.length} users in TP.HCM`);

    const hcmTeamIds = [...new Set(hcmUsers.map(user => user.team_id))].filter(Boolean);
    
    if (hcmTeamIds.length > 0) {
      const { data: hcmTeams, error: hcmTeamsError } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', hcmTeamIds)
        .order('name');

      console.log('HCM teams response:', { data: hcmTeams, error: hcmTeamsError });

      if (!hcmTeamsError && hcmTeams) {
        const hcmTeamsWithLeaders = hcmTeams.map(team => {
          const teamLeader = hcmUsers.find(user =>
            user.team_id === team.id && user.role === 'team_leader'
          );

          return {
            ...team,
            leader_name: teamLeader?.name || null
          };
        });

        console.log('\n✅ HCM teams with leaders:');
        hcmTeamsWithLeaders.forEach(team => {
          console.log(`   - ${team.name} (Leader: ${team.leader_name})`);
        });
      }
    }

    // Test 3: Check RLS policies
    console.log('\n3. Testing RLS policies...');
    
    const { data: allTeams, error: allTeamsError } = await supabase
      .from('teams')
      .select('*');

    console.log('All teams with ANON key:', { 
      count: allTeams?.length || 0, 
      error: allTeamsError 
    });

    if (allTeamsError) {
      console.error('❌ RLS might be blocking ANON access to teams table');
      console.log('💡 Solution: Create permissive RLS policy for teams table');
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugTeamAPI();
