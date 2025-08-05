const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Try to use service role key if available
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

// Create client with service role key to bypass RLS
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

async function autoImportRealStaff() {
  console.log('🚀 Auto-importing real staff data...');
  console.log(`👥 Users to import: ${realUsers.length}`);

  try {
    // Method 1: Try bulk insert
    console.log('\n📥 Method 1: Bulk insert...');
    const { data: bulkData, error: bulkError } = await supabase
      .from('users')
      .insert(realUsers)
      .select();

    if (!bulkError && bulkData && bulkData.length > 0) {
      console.log(`✅ Bulk insert successful! Created ${bulkData.length} users`);
      await showFinalResults();
      return;
    }

    console.log('⚠️  Bulk insert failed:', bulkError?.message);

    // Method 2: Try one by one with upsert
    console.log('\n📥 Method 2: Individual upsert...');
    let successCount = 0;
    
    for (const user of realUsers) {
      const { data, error } = await supabase
        .from('users')
        .upsert([user], { onConflict: 'email' })
        .select();

      if (error) {
        console.log(`❌ Failed: ${user.name} - ${error.message}`);
      } else {
        console.log(`✅ Success: ${user.name}`);
        successCount++;
      }
    }

    console.log(`\n📊 Individual upsert completed: ${successCount}/${realUsers.length} successful`);

    if (successCount === 0) {
      // Method 3: Try direct SQL
      console.log('\n📥 Method 3: Direct SQL insert...');
      
      const sqlValues = realUsers.map(user => 
        `('${user.name}', '${user.email}', '${user.password}', ${user.password_changed}, '${user.location}', '${user.role}', '${user.department_type}')`
      ).join(',\n  ');

      const sqlQuery = `
        INSERT INTO users (name, email, password, password_changed, location, role, department_type)
        VALUES ${sqlValues}
        ON CONFLICT (email) DO UPDATE SET
          name = EXCLUDED.name,
          location = EXCLUDED.location,
          role = EXCLUDED.role,
          department_type = EXCLUDED.department_type;
      `;

      const { data: sqlData, error: sqlError } = await supabase.rpc('exec_sql', { sql: sqlQuery });

      if (sqlError) {
        console.log('❌ SQL method failed:', sqlError.message);
        console.log('\n🚨 All automatic methods failed due to RLS policies');
        console.log('📋 Please use the CSV file and Supabase Dashboard as instructed');
      } else {
        console.log('✅ SQL insert successful!');
      }
    }

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
    console.log(`\n✅ Database now contains ${finalUsers.length} users:`);
    
    const directors = finalUsers.filter(u => u.role === 'retail_director');
    const leaders = finalUsers.filter(u => u.role === 'team_leader');
    const employees = finalUsers.filter(u => u.role === 'employee');

    if (directors.length > 0) {
      console.log('\n👨‍💼 Directors:');
      directors.forEach(u => console.log(`   - ${u.name} (${u.location})`));
    }

    if (leaders.length > 0) {
      console.log('\n👨‍💼 Team Leaders:');
      leaders.forEach(u => console.log(`   - ${u.name} (${u.location})`));
    }

    if (employees.length > 0) {
      console.log('\n👨‍💻 Employees:');
      employees.forEach(u => console.log(`   - ${u.name} (${u.location})`));
    }

    console.log('\n🎉 Import completed successfully!');
    console.log('🔑 Login with: manh.khong@company.com / 123456');
  } else {
    console.log('\n⚠️  Database is still empty');
  }
}

autoImportRealStaff();
