const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Create client with SERVICE ROLE KEY to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Teams data based on your organization structure
const teamsData = [
  // Hà Nội teams
  {
    name: 'NHÓM 1 - Lương Việt Anh',
    location: 'HN',
    description: 'Nhóm kinh doanh Hà Nội 1',
    leader_email: 'anh.luong@company.com'
  },
  {
    name: 'NHÓM 2 - Nguyễn Thị Thảo',
    location: 'HN', 
    description: 'Nhóm kinh doanh Hà Nội 2',
    leader_email: 'thao.nguyen@company.com'
  },
  {
    name: 'NHÓM 3 - Trịnh Thị Bốn',
    location: 'HN',
    description: 'Nhóm kinh doanh Hà Nội 3',
    leader_email: 'bon.trinh@company.com'
  },
  {
    name: 'NHÓM 4 - Phạm Thị Hương',
    location: 'HN',
    description: 'Nhóm kinh doanh Hà Nội 4',
    leader_email: 'huong.pham@company.com'
  },
  
  // TP.HCM teams
  {
    name: 'NHÓM 1 HCM - Nguyễn Thị Nga',
    location: 'HCM',
    description: 'Nhóm kinh doanh TP.HCM 1',
    leader_email: 'nga.nguyen@company.com'
  },
  {
    name: 'NHÓM 2 HCM - Nguyễn Ngọc Việt Khanh',
    location: 'HCM',
    description: 'Nhóm kinh doanh TP.HCM 2',
    leader_email: 'khanh.nguyen@company.com'
  }
];

// Team member assignments
const teamAssignments = {
  'NHÓM 1 - Lương Việt Anh': [
    'anh.luong@company.com',    // Team leader
    'duy.le@company.com',       // Lê Khánh Duy - Sale
    'ha.quan@company.com'       // Quản Thu Hà - Sale
  ],
  'NHÓM 2 - Nguyễn Thị Thảo': [
    'thao.nguyen@company.com',  // Team leader
    'linh.nguyen@company.com'   // Nguyễn Mạnh Linh
  ],
  'NHÓM 3 - Trịnh Thị Bốn': [
    'bon.trinh@company.com'     // Team leader only
  ],
  'NHÓM 4 - Phạm Thị Hương': [
    'huong.pham@company.com'    // Team leader only
  ],
  'NHÓM 1 HCM - Nguyễn Thị Nga': [
    'nga.nguyen@company.com',   // Team leader
    'tuyen.ha@company.com'      // Hà Nguyễn Thanh Tuyền - Sale
  ],
  'NHÓM 2 HCM - Nguyễn Ngọc Việt Khanh': [
    'khanh.nguyen@company.com', // Team leader
    'van.phung@company.com'     // Phùng Thị Thùy Vân - Sale
  ]
};

async function updateTeamsAndRegions() {
  console.log('🏢 Updating teams and regions...');

  try {
    // 1. Get all current users
    console.log('\n👥 Getting current users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, role, location');

    if (usersError) {
      console.error('❌ Error getting users:', usersError);
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    // 2. Create teams
    console.log('\n📋 Creating teams...');
    const createdTeams = [];

    for (const teamData of teamsData) {
      const teamToInsert = {
        name: teamData.name,
        description: teamData.description
      };

      const { data: team, error: teamError } = await supabase
        .from('teams')
        .upsert([teamToInsert], { onConflict: 'name' })
        .select()
        .single();

      if (teamError) {
        console.error(`❌ Error creating team ${teamData.name}:`, teamError);
      } else {
        console.log(`✅ Created team: ${teamData.name}`);
        createdTeams.push({ ...team, location: teamData.location });
      }
    }

    // 3. Update users with team assignments
    console.log('\n👥 Assigning users to teams...');
    
    for (const [teamName, memberEmails] of Object.entries(teamAssignments)) {
      const team = createdTeams.find(t => t.name === teamName);
      if (!team) {
        console.log(`⚠️  Team not found: ${teamName}`);
        continue;
      }

      for (const email of memberEmails) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ team_id: team.id })
          .eq('email', email);

        if (updateError) {
          console.error(`❌ Error assigning ${email} to ${teamName}:`, updateError);
        } else {
          const user = users.find(u => u.email === email);
          console.log(`✅ Assigned: ${user?.name} → ${teamName}`);
        }
      }
    }

    // 4. Show final results
    await showTeamStructure();

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function showTeamStructure() {
  console.log('\n🔍 Final team structure:');

  try {
    // Get users with team info
    const { data: usersWithTeams, error } = await supabase
      .from('users')
      .select(`
        id, name, email, role, location, 
        teams:team_id (id, name, description)
      `)
      .order('location')
      .order('role', { ascending: false });

    if (error) {
      console.error('❌ Error getting team structure:', error);
      return;
    }

    // Group by location
    const hanoiUsers = usersWithTeams.filter(u => u.location === 'Hà Nội');
    const hcmUsers = usersWithTeams.filter(u => u.location === 'Hồ Chí Minh');
    const director = usersWithTeams.find(u => u.role === 'retail_director');

    console.log('\n🏢 ORGANIZATIONAL STRUCTURE:');

    // Director
    if (director) {
      console.log('\n👨‍💼 RETAIL DIRECTOR:');
      console.log(`   🔹 ${director.name} (${director.location})`);
    }

    // Hà Nội
    console.log('\n🏙️  HÀ NỘI (4 NHÓM):');
    const hanoiTeams = [...new Set(hanoiUsers.filter(u => u.teams).map(u => u.teams.name))];
    
    for (const teamName of hanoiTeams) {
      const teamMembers = hanoiUsers.filter(u => u.teams?.name === teamName);
      const leader = teamMembers.find(u => u.role === 'team_leader');
      const employees = teamMembers.filter(u => u.role === 'employee');

      console.log(`\n   📋 ${teamName}:`);
      if (leader) {
        console.log(`      👨‍💼 ${leader.name} - Trưởng nhóm`);
      }
      employees.forEach(emp => {
        console.log(`      👨‍💻 ${emp.name} - Nhân viên ${emp.department_type}`);
      });
    }

    // TP.HCM
    console.log('\n🌆 TP.HCM (2 NHÓM):');
    const hcmTeams = [...new Set(hcmUsers.filter(u => u.teams).map(u => u.teams.name))];
    
    for (const teamName of hcmTeams) {
      const teamMembers = hcmUsers.filter(u => u.teams?.name === teamName);
      const leader = teamMembers.find(u => u.role === 'team_leader');
      const employees = teamMembers.filter(u => u.role === 'employee');

      console.log(`\n   📋 ${teamName}:`);
      if (leader) {
        console.log(`      👨‍💼 ${leader.name} - Trưởng nhóm`);
      }
      employees.forEach(emp => {
        console.log(`      👨‍💻 ${emp.name} - Nhân viên ${emp.department_type}`);
      });
    }

    // Summary
    console.log('\n📊 SUMMARY:');
    console.log(`   Total users: ${usersWithTeams.length}`);
    console.log(`   Hà Nội: ${hanoiUsers.length} users, ${hanoiTeams.length} teams`);
    console.log(`   TP.HCM: ${hcmUsers.length} users, ${hcmTeams.length} teams`);
    console.log(`   Teams created: ${hanoiTeams.length + hcmTeams.length}`);

    console.log('\n🎉 TEAMS AND REGIONS UPDATE COMPLETED!');
    console.log('🔑 Login: manh.khong@company.com / 123456');
    console.log('🌐 Web app: http://localhost:3003/auth/director-login');

  } catch (error) {
    console.error('❌ Error showing team structure:', error);
  }
}

updateTeamsAndRegions();
