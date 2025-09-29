const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase Connection...');
  
  const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    console.log('📍 Step 1: Testing basic connection...');
    const { data, error } = await supabase.from('tasks').select('id').limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Sample data:', data);
    
    console.log('📍 Step 2: Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(3);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible!');
      console.log('👥 Sample users:', users);
    }
    
    console.log('📍 Step 3: Testing teams table...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name')
      .limit(3);
    
    if (teamsError) {
      console.error('❌ Teams table error:', teamsError);
    } else {
      console.log('✅ Teams table accessible!');
      console.log('🏢 Sample teams:', teams);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Test specific user lookup
async function testUserLookup() {
  console.log('\n🔍 Testing User Lookup...');
  
  const supabaseUrl = 'https://fnakxavwxubnbucfoujd.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    // Look for "Trịnh Thị Bốn" user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'bon.trinh@company.com')
      .single();
    
    if (error) {
      console.error('❌ User lookup failed:', error);
      
      // Try to find any user with similar name
      const { data: allUsers, error: allError } = await supabase
        .from('users')
        .select('id, name, email')
        .ilike('name', '%Trịnh%');
      
      if (!allError && allUsers) {
        console.log('🔍 Found similar users:', allUsers);
      }
      
      return null;
    }
    
    console.log('✅ User found:', {
      id: user.id,
      name: user.name,
      email: user.email,
      team_id: user.team_id,
      location: user.location
    });
    
    return user;
    
  } catch (error) {
    console.error('❌ User lookup error:', error);
    return null;
  }
}

// Run tests
async function runAllTests() {
  console.log('🚀 Starting Supabase Connection Tests...\n');
  
  const connectionOk = await testSupabaseConnection();
  
  if (connectionOk) {
    await testUserLookup();
  }
  
  console.log('\n🎯 Test Summary:');
  console.log(`📡 Connection: ${connectionOk ? '✅ OK' : '❌ FAILED'}`);
}

runAllTests().catch(console.error);
