const { createClient } = require('@supabase/supabase-js');

async function testUserAPI() {
  console.log('🔍 Testing User API Calls...');
  
  const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Test 1: Get team info for "NHÓM 3 - Trịnh Thị Bốn"
    console.log('📍 Step 1: Getting team info...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .ilike('name', '%Trịnh Thị Bốn%');
    
    if (teamsError) {
      console.error('❌ Teams query error:', teamsError);
      return;
    }
    
    console.log('✅ Teams found:', teams);
    
    if (teams && teams.length > 0) {
      const targetTeam = teams[0];
      console.log('🎯 Target team:', {
        id: targetTeam.id,
        name: targetTeam.name,
        location: targetTeam.location
      });
      
      // Test 2: Get users by team_id
      console.log('📍 Step 2: Getting users by team_id...');
      const { data: usersByTeam, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', targetTeam.id);
      
      if (usersError) {
        console.error('❌ Users by team query error:', usersError);
      } else {
        console.log('✅ Users by team:', usersByTeam);
      }
      
      // Test 3: Get users by team_id AND location
      console.log('📍 Step 3: Getting users by team_id AND location...');
      const { data: usersByTeamAndLocation, error: usersLocationError } = await supabase
        .from('users')
        .select('*')
        .eq('team_id', targetTeam.id)
        .eq('location', 'Hà Nội');
      
      if (usersLocationError) {
        console.error('❌ Users by team and location query error:', usersLocationError);
      } else {
        console.log('✅ Users by team and location:', usersByTeamAndLocation);
      }
      
      // Test 4: Check if Trịnh Thị Bốn exists
      console.log('📍 Step 4: Looking for Trịnh Thị Bốn specifically...');
      const { data: bonUser, error: bonError } = await supabase
        .from('users')
        .select('*')
        .eq('name', 'Trịnh Thị Bốn');
      
      if (bonError) {
        console.error('❌ Trịnh Thị Bốn query error:', bonError);
      } else {
        console.log('✅ Trịnh Thị Bốn user:', bonUser);
      }
      
      // Test 5: Check all users in Hà Nội
      console.log('📍 Step 5: All users in Hà Nội...');
      const { data: allHanoiUsers, error: hanoiError } = await supabase
        .from('users')
        .select('id, name, email, team_id, location')
        .eq('location', 'Hà Nội')
        .order('name');
      
      if (hanoiError) {
        console.error('❌ Hà Nội users query error:', hanoiError);
      } else {
        console.log('✅ All Hà Nội users:', allHanoiUsers);
      }
      
    } else {
      console.log('❌ No team found with "Trịnh Thị Bốn" in name');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserAPI().catch(console.error);
