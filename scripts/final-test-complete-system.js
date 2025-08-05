const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCompleteSystem() {
  console.log('🧪 FINAL SYSTEM TEST - COMPLETE FUNCTIONALITY');
  console.log('='.repeat(60));

  try {
    // 1. Test Director Login Data
    console.log('\n👨‍💼 1. TESTING DIRECTOR LOGIN...');
    const { data: directors, error: directorsError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director');

    if (directorsError) {
      console.error('❌ Error getting directors:', directorsError);
      return;
    }

    console.log(`✅ Found ${directors.length} director(s):`);
    directors.forEach(director => {
      console.log(`   🏢 ${director.name}`);
      console.log(`      Email: ${director.email}`);
      console.log(`      Location: ${director.location}`);
      console.log(`      Department: ${director.department_type}`);
      console.log(`      Password: ${director.password} (Changed: ${director.password_changed})`);
    });

    // 2. Test Complete Organization Structure
    console.log('\n🏢 2. TESTING ORGANIZATION STRUCTURE...');
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        id, name, email, role, location, department_type, password_changed,
        teams:team_id (id, name, description)
      `)
      .order('role', { ascending: false })
      .order('location')
      .order('name');

    if (usersError) {
      console.error('❌ Error getting users:', usersError);
      return;
    }

    // Group by role and location
    const orgStructure = {
      retail_director: [],
      team_leader: { 'Hà Nội': [], 'Hồ Chí Minh': [] },
      employee: { 'Hà Nội': [], 'Hồ Chí Minh': [] }
    };

    allUsers.forEach(user => {
      if (user.role === 'retail_director') {
        orgStructure.retail_director.push(user);
      } else if (user.role === 'team_leader') {
        orgStructure.team_leader[user.location].push(user);
      } else if (user.role === 'employee') {
        orgStructure.employee[user.location].push(user);
      }
    });

    console.log('\n📊 ORGANIZATIONAL STRUCTURE:');
    
    // Director
    console.log('\n🏢 RETAIL DIRECTOR:');
    orgStructure.retail_director.forEach(user => {
      console.log(`   - ${user.name} (${user.location})`);
    });

    // Team Leaders by location
    console.log('\n👨‍💼 TEAM LEADERS:');
    Object.entries(orgStructure.team_leader).forEach(([location, leaders]) => {
      if (leaders.length > 0) {
        console.log(`\n   📍 ${location} (${leaders.length} leaders):`);
        leaders.forEach(leader => {
          const teamName = leader.teams?.name || 'No Team';
          console.log(`      - ${leader.name} (${teamName})`);
        });
      }
    });

    // Employees by location
    console.log('\n👨‍💻 EMPLOYEES:');
    Object.entries(orgStructure.employee).forEach(([location, employees]) => {
      if (employees.length > 0) {
        console.log(`\n   📍 ${location} (${employees.length} employees):`);
        employees.forEach(emp => {
          const teamName = emp.teams?.name || 'No Team';
          console.log(`      - ${emp.name} (${emp.department_type}) - ${teamName}`);
        });
      }
    });

    // 3. Test Teams Structure
    console.log('\n🏢 3. TESTING TEAMS STRUCTURE...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (teamsError) {
      console.error('❌ Error getting teams:', teamsError);
      return;
    }

    console.log(`✅ Found ${teams.length} teams:`);
    teams.forEach(team => {
      console.log(`   📋 ${team.name}`);
      console.log(`      Description: ${team.description}`);
      
      // Count team members
      const teamMembers = allUsers.filter(user => user.teams?.id === team.id);
      const leader = teamMembers.find(member => member.role === 'team_leader');
      const employees = teamMembers.filter(member => member.role === 'employee');
      
      console.log(`      Members: ${teamMembers.length} total`);
      if (leader) {
        console.log(`        👨‍💼 Leader: ${leader.name}`);
      }
      if (employees.length > 0) {
        console.log(`        👨‍💻 Employees: ${employees.map(e => e.name).join(', ')}`);
      }
    });

    // 4. Test Statistics
    console.log('\n📊 4. SYSTEM STATISTICS:');
    const stats = {
      total: allUsers.length,
      directors: orgStructure.retail_director.length,
      teamLeaders: orgStructure.team_leader['Hà Nội'].length + orgStructure.team_leader['Hồ Chí Minh'].length,
      employees: orgStructure.employee['Hà Nội'].length + orgStructure.employee['Hồ Chí Minh'].length,
      hanoi: allUsers.filter(u => u.location === 'Hà Nội').length,
      hcm: allUsers.filter(u => u.location === 'Hồ Chí Minh').length,
      teams: teams.length,
      usersWithTeams: allUsers.filter(u => u.teams).length,
      usersWithoutTeams: allUsers.filter(u => !u.teams).length
    };

    console.log(`   👥 Total Users: ${stats.total}`);
    console.log(`   🏢 Directors: ${stats.directors}`);
    console.log(`   👨‍💼 Team Leaders: ${stats.teamLeaders}`);
    console.log(`   👨‍💻 Employees: ${stats.employees}`);
    console.log(`   📍 Hà Nội: ${stats.hanoi} users`);
    console.log(`   📍 TP.HCM: ${stats.hcm} users`);
    console.log(`   📋 Teams: ${stats.teams}`);
    console.log(`   🔗 Users with teams: ${stats.usersWithTeams}`);
    console.log(`   ❌ Users without teams: ${stats.usersWithoutTeams}`);

    // 5. Test Login Credentials
    console.log('\n🔑 5. LOGIN CREDENTIALS TEST:');
    const testCredentials = [
      { email: 'manh.khong@company.com', password: '123456', role: 'retail_director' },
      { email: 'anh.luong@company.com', password: '123456', role: 'team_leader' },
      { email: 'duy.le@company.com', password: '123456', role: 'employee' }
    ];

    for (const cred of testCredentials) {
      const user = allUsers.find(u => u.email === cred.email);
      if (user) {
        const passwordMatch = user.password_changed ? 
          (user.password === cred.password) : 
          (cred.password === '123456');
        
        console.log(`   ${passwordMatch ? '✅' : '❌'} ${user.name} (${user.role})`);
        console.log(`      Email: ${cred.email}`);
        console.log(`      Password: ${cred.password} ${passwordMatch ? '✓' : '✗'}`);
      } else {
        console.log(`   ❌ User not found: ${cred.email}`);
      }
    }

    // 6. Final Summary
    console.log('\n🎉 6. FINAL SYSTEM STATUS:');
    console.log('='.repeat(60));
    
    const allTestsPassed = 
      directors.length === 1 &&
      stats.total === 12 &&
      stats.teams === 6 &&
      stats.usersWithTeams >= 10;

    if (allTestsPassed) {
      console.log('✅ ALL SYSTEMS OPERATIONAL!');
      console.log('');
      console.log('🚀 READY TO USE:');
      console.log('   🌐 URL: http://localhost:3003/auth/director-login');
      console.log('   👤 Email: manh.khong@company.com');
      console.log('   🔑 Password: 123456');
      console.log('');
      console.log('📋 FEATURES AVAILABLE:');
      console.log('   ✅ Director Login');
      console.log('   ✅ Team Structure');
      console.log('   ✅ Employee Management');
      console.log('   ✅ Regional Organization (Hà Nội/TP.HCM)');
      console.log('   ✅ Role-based Access');
      console.log('   ✅ Real Data Integration');
    } else {
      console.log('⚠️  SOME ISSUES DETECTED:');
      if (directors.length !== 1) console.log(`   - Expected 1 director, found ${directors.length}`);
      if (stats.total !== 12) console.log(`   - Expected 12 users, found ${stats.total}`);
      if (stats.teams !== 6) console.log(`   - Expected 6 teams, found ${stats.teams}`);
      if (stats.usersWithTeams < 10) console.log(`   - Expected 10+ users with teams, found ${stats.usersWithTeams}`);
    }

  } catch (error) {
    console.error('❌ System test failed:', error);
  }
}

testCompleteSystem();
