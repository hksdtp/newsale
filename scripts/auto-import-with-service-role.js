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

const realUsers = [
  {
    name: 'Khổng Đức Mạnh',
    email: 'manh.khong@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'retail_director',
    department_type: 'Retail'
  },
  {
    name: 'Lương Việt Anh',
    email: 'anh.luong@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Lê Khánh Duy',
    email: 'duy.le@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'employee',
    department_type: 'Sale'
  },
  {
    name: 'Quản Thu Hà',
    email: 'ha.quan@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'employee',
    department_type: 'Sale'
  },
  {
    name: 'Nguyễn Thị Thảo',
    email: 'thao.nguyen@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Nguyễn Mạnh Linh',
    email: 'linh.nguyen@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'employee',
    department_type: 'Sale'
  },
  {
    name: 'Trịnh Thị Bốn',
    email: 'bon.trinh@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Phạm Thị Hương',
    email: 'huong.pham@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hà Nội',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Nguyễn Thị Nga',
    email: 'nga.nguyen@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hồ Chí Minh',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Hà Nguyễn Thanh Tuyền',
    email: 'tuyen.ha@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hồ Chí Minh',
    role: 'employee',
    department_type: 'Sale'
  },
  {
    name: 'Nguyễn Ngọc Việt Khanh',
    email: 'khanh.nguyen@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hồ Chí Minh',
    role: 'team_leader',
    department_type: 'Kinh doanh'
  },
  {
    name: 'Phùng Thị Thùy Vân',
    email: 'van.phung@company.com',
    password: '123456',
    password_changed: false,
    location: 'Hồ Chí Minh',
    role: 'employee',
    department_type: 'Sale'
  }
];

async function autoImportWithServiceRole() {
  console.log('🚀 Auto-importing with Service Role Key (bypasses RLS)...');
  console.log(`👥 Users to import: ${realUsers.length}`);

  try {
    // First, clear existing data
    console.log('\n🗑️  Clearing existing users...');
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.log('⚠️  Could not clear existing users:', deleteError.message);
    } else {
      console.log('✅ Existing users cleared');
    }

    // Bulk insert all users
    console.log('\n📥 Bulk inserting real staff...');
    const { data: insertedUsers, error: insertError } = await supabase
      .from('users')
      .insert(realUsers)
      .select();

    if (insertError) {
      console.error('❌ Bulk insert failed:', insertError);
      
      // Fallback: Insert one by one
      console.log('\n📥 Fallback: Inserting one by one...');
      let successCount = 0;
      
      for (const user of realUsers) {
        const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select();

        if (error) {
          console.log(`❌ Failed: ${user.name} - ${error.message}`);
        } else {
          console.log(`✅ Success: ${user.name}`);
          successCount++;
        }
      }
      
      console.log(`\n📊 Individual insert completed: ${successCount}/${realUsers.length} successful`);
    } else {
      console.log(`✅ Bulk insert successful! Created ${insertedUsers.length} users`);
    }

    // Show final results
    await showFinalResults();

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function showFinalResults() {
  console.log('\n🔍 Checking final results...');
  
  const { data: finalUsers, error } = await supabase
    .from('users')
    .select('name, email, role, location')
    .order('role', { ascending: false })
    .order('name');

  if (error) {
    console.error('❌ Error checking results:', error);
    return;
  }

  if (finalUsers && finalUsers.length > 0) {
    console.log(`\n✅ SUCCESS! Database now contains ${finalUsers.length} users:`);
    
    const directors = finalUsers.filter(u => u.role === 'retail_director');
    const leaders = finalUsers.filter(u => u.role === 'team_leader');
    const employees = finalUsers.filter(u => u.role === 'employee');

    if (directors.length > 0) {
      console.log('\n👨‍💼 RETAIL DIRECTOR:');
      directors.forEach(u => console.log(`   - ${u.name} (${u.location})`));
    }

    if (leaders.length > 0) {
      console.log('\n👨‍💼 TEAM LEADERS:');
      leaders.forEach(u => console.log(`   - ${u.name} (${u.location})`));
    }

    if (employees.length > 0) {
      console.log('\n👨‍💻 EMPLOYEES:');
      employees.forEach(u => console.log(`   - ${u.name} (${u.location})`));
    }

    console.log('\n📊 SUMMARY:');
    console.log(`   Total: ${finalUsers.length} users`);
    console.log(`   Hà Nội: ${finalUsers.filter(u => u.location === 'Hà Nội').length} users`);
    console.log(`   TP.HCM: ${finalUsers.filter(u => u.location === 'Hồ Chí Minh').length} users`);

    console.log('\n🎉 IMPORT COMPLETED SUCCESSFULLY!');
    console.log('🔑 Login credentials:');
    console.log('   Email: manh.khong@company.com');
    console.log('   Password: 123456');
    console.log('🌐 Web app: http://localhost:3003/auth/director-login');
  } else {
    console.log('\n⚠️  Database is still empty');
  }
}

autoImportWithServiceRole();
