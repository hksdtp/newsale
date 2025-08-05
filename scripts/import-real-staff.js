const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Real staff data from your organization
const realTeams = [
  // Hà Nội teams
  { name: 'NHÓM 1 - Lương Việt Anh', location: 'HN', description: 'Nhóm kinh doanh Hà Nội 1' },
  { name: 'NHÓM 2 - Nguyễn Thị Thảo', location: 'HN', description: 'Nhóm kinh doanh Hà Nội 2' },
  { name: 'NHÓM 3 - Trịnh Thị Bốn', location: 'HN', description: 'Nhóm kinh doanh Hà Nội 3' },
  { name: 'NHÓM 4 - Phạm Thị Hương', location: 'HN', description: 'Nhóm kinh doanh Hà Nội 4' },
  
  // TP.HCM teams
  { name: 'NHÓM 1 HCM - Nguyễn Thị Nga', location: 'HCM', description: 'Nhóm kinh doanh TP.HCM 1' },
  { name: 'NHÓM 2 HCM - Nguyễn Ngọc Việt Khanh', location: 'HCM', description: 'Nhóm kinh doanh TP.HCM 2' }
];

const realUsers = [
  // Director
  {
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@company.com',
    role: 'retail_director',
    location: 'Hà Nội',
    department_type: 'Retail',
    team_name: null // Director doesn't belong to specific team
  },
  
  // Hà Nội - NHÓM 1
  {
    name: 'Lương Việt Anh',
    email: 'anh.luong@company.com',
    role: 'team_leader',
    location: 'Hà Nội',
    department_type: 'Kinh doanh',
    team_name: 'NHÓM 1 - Lương Việt Anh'
  },
  {
    name: 'Lê Khánh Duy',
    email: 'duy.le@company.com',
    role: 'employee',
    location: 'Hà Nội',
    department_type: 'Sale',
    team_name: 'NHÓM 1 - Lương Việt Anh'
  },
  {
    name: 'Quản Thu Hà',
    email: 'ha.quan@company.com',
    role: 'employee',
    location: 'Hà Nội',
    department_type: 'Sale',
    team_name: 'NHÓM 1 - Lương Việt Anh'
  },
  
  // Hà Nội - NHÓM 2
  {
    name: 'Nguyễn Thị Thảo',
    email: 'thao.nguyen@company.com',
    role: 'team_leader',
    location: 'Hà Nội',
    department_type: 'Kinh doanh',
    team_name: 'NHÓM 2 - Nguyễn Thị Thảo'
  },
  {
    name: 'Nguyễn Mạnh Linh',
    email: 'linh.nguyen@company.com',
    role: 'employee',
    location: 'Hà Nội',
    department_type: 'Sale',
    team_name: 'NHÓM 2 - Nguyễn Thị Thảo'
  },
  
  // Hà Nội - NHÓM 3
  {
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@company.com',
    role: 'team_leader',
    location: 'Hà Nội',
    department_type: 'Kinh doanh',
    team_name: 'NHÓM 3 - Trịnh Thị Bốn'
  },
  
  // Hà Nội - NHÓM 4
  {
    name: 'Phạm Thị Hương',
    email: 'huong.pham@company.com',
    role: 'team_leader',
    location: 'Hà Nội',
    department_type: 'Kinh doanh',
    team_name: 'NHÓM 4 - Phạm Thị Hương'
  },
  
  // TP.HCM - NHÓM 1
  {
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@company.com',
    role: 'team_leader',
    location: 'Hồ Chí Minh',
    department_type: 'Kinh doanh',
    team_name: 'NHÓM 1 HCM - Nguyễn Thị Nga'
  },
  {
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@company.com',
    role: 'employee',
    location: 'Hồ Chí Minh',
    department_type: 'Sale',
    team_name: 'NHÓM 1 HCM - Nguyễn Thị Nga'
  },
  
  // TP.HCM - NHÓM 2
  {
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'khanh.nguyen@company.com',
    role: 'team_leader',
    location: 'Hồ Chí Minh',
    department_type: 'Kinh doanh',
    team_name: 'NHÓM 2 HCM - Nguyễn Ngọc Việt Khanh'
  },
  {
    name: 'Phùng Thị Thùy Vân',
    email: 'van.phung@company.com',
    role: 'employee',
    location: 'Hồ Chí Minh',
    department_type: 'Sale',
    team_name: 'NHÓM 2 HCM - Nguyễn Ngọc Việt Khanh'
  }
];

async function importRealStaff() {
  console.log('🏢 Importing real staff data...');
  console.log(`👥 Users: ${realUsers.length}`);

  try {
    // Skip teams for now due to schema issues
    console.log('\n⚠️  Skipping teams creation due to schema issues');
    console.log('👥 Creating users without team assignments...');

    // Prepare users without team_id
    const usersToInsert = realUsers.map(user => ({
      name: user.name,
      email: user.email,
      password: '123456',
      password_changed: false,
      team_id: null, // Skip team assignment for now
      location: user.location,
      role: user.role,
      department_type: user.department_type
    }));

    // Insert users
    console.log('\n👥 Creating users...');
    for (const user of usersToInsert) {
      const { data: insertedUser, error: userError } = await supabase
        .from('users')
        .upsert([user], { onConflict: 'email' })
        .select();

      if (userError) {
        console.error(`❌ Error creating ${user.name}:`, userError);
      } else {
        console.log(`✅ Created: ${user.name} (${user.role})`);
      }
    }

    // Summary
    console.log('\n📊 Import Summary:');
    console.log(`   Users: ${realUsers.length}`);

    console.log('\n🏢 Users by location:');
    console.log(`   Hà Nội: ${realUsers.filter(u => u.location === 'Hà Nội').length} users`);
    console.log(`   TP.HCM: ${realUsers.filter(u => u.location === 'Hồ Chí Minh').length} users`);
    
    console.log('\n👥 Users by role:');
    const roleCount = {};
    realUsers.forEach(user => {
      roleCount[user.role] = (roleCount[user.role] || 0) + 1;
    });
    Object.entries(roleCount).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

    console.log('\n🎉 Real staff data imported successfully!');
    console.log('🔑 All users have password: 123456');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

importRealStaff();
