const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock teams data
const mockTeams = [
  {
    name: 'NHÓM 1 - Lương Việt Anh',
    location: 'HN',
    description: 'Nhóm kinh doanh Hà Nội'
  },
  {
    name: 'NHÓM 2 - Marketing HN',
    location: 'HN', 
    description: 'Nhóm marketing Hà Nội'
  },
  {
    name: 'NHÓM 3 - Kinh doanh HCM',
    location: 'HCM',
    description: 'Nhóm kinh doanh Hồ Chí Minh'
  },
  {
    name: 'NHÓM 4 - Vận hành HCM',
    location: 'HCM',
    description: 'Nhóm vận hành Hồ Chí Minh'
  }
];

// Mock users data
const mockUsers = [
  // Team 1 - HN (Lương Việt Anh's team)
  {
    name: 'Lương Việt Anh',
    email: 'anh.luong@company.com',
    team_name: 'NHÓM 1 - Lương Việt Anh',
    location: 'Hà Nội',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Lê Khánh Duy',
    email: 'duy.le@company.com',
    team_name: 'NHÓM 1 - Lương Việt Anh',
    location: 'Hà Nội',
    role: 'employee',
    department_type: 'Kinh doanh'
  },
  
  // Team 2 - HN  
  {
    name: 'Phạm Thị Dung',
    email: 'dung.pham@company.com',
    team_name: 'NHÓM 2 - Marketing HN',
    location: 'Hà Nội',
    role: 'team_leader',
    department_type: 'Marketing'
  },
  {
    name: 'Hoàng Văn Em',
    email: 'em.hoang@company.com',
    team_name: 'NHÓM 2 - Marketing HN',
    location: 'Hà Nội',
    role: 'employee',
    department_type: 'Marketing'
  },
  
  // Team 3 - HCM
  {
    name: 'Võ Thị Phương',
    email: 'phuong.vo@company.com',
    team_name: 'NHÓM 3 - Kinh doanh HCM',
    location: 'Hồ Chí Minh',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Đặng Văn Giang',
    email: 'giang.dang@company.com',
    team_name: 'NHÓM 3 - Kinh doanh HCM',
    location: 'Hồ Chí Minh',
    role: 'employee',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Bùi Thị Hoa',
    email: 'hoa.bui@company.com',
    team_name: 'NHÓM 3 - Kinh doanh HCM',
    location: 'Hồ Chí Minh',
    role: 'employee',
    department_type: 'Kinh doanh'
  },
  
  // Team 4 - HCM
  {
    name: 'Ngô Văn Ích',
    email: 'ich.ngo@company.com',
    team_name: 'NHÓM 4 - Vận hành HCM',
    location: 'Hồ Chí Minh',
    role: 'team_leader',
    department_type: 'Vận hành'
  },
  {
    name: 'Lý Thị Kim',
    email: 'kim.ly@company.com',
    team_name: 'NHÓM 4 - Vận hành HCM',
    location: 'Hồ Chí Minh',
    role: 'employee',
    department_type: 'Vận hành'
  }
];

async function importMockData() {
  console.log('🚀 Starting mock data import...');

  try {
    // 1. Insert teams first
    console.log('📋 Inserting teams...');
    const { data: insertedTeams, error: teamsError } = await supabase
      .from('teams')
      .upsert(mockTeams, { onConflict: 'name' })
      .select();

    if (teamsError) {
      console.error('❌ Error inserting teams:', teamsError);
      return;
    }

    console.log(`✅ Inserted ${insertedTeams.length} teams`);

    // 2. Get team IDs for users
    const { data: allTeams, error: fetchTeamsError } = await supabase
      .from('teams')
      .select('id, name');

    if (fetchTeamsError) {
      console.error('❌ Error fetching teams:', fetchTeamsError);
      return;
    }

    const teamMap = new Map();
    allTeams.forEach(team => teamMap.set(team.name, team.id));

    // 3. Prepare users with team_id
    const usersToInsert = mockUsers.map(user => ({
      name: user.name,
      email: user.email,
      password: '123456',
      password_changed: false,
      team_id: teamMap.get(user.team_name),
      location: user.location,
      role: user.role,
      department_type: user.department_type
    }));

    // 4. Insert users
    console.log('👥 Inserting users...');
    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .upsert(usersToInsert, { onConflict: 'email' })
      .select();

    if (usersError) {
      console.error('❌ Error inserting users:', usersError);
      return;
    }

    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // 5. Summary
    console.log('\n📊 Import Summary:');
    console.log(`   Teams: ${insertedTeams.length}`);
    console.log(`   Users: ${insertedUsers.length}`);
    
    console.log('\n👥 Users by role:');
    const roleCount = {};
    insertedUsers.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    console.log('\n🎉 Mock data import completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

importMockData();
