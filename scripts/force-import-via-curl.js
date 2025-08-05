const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const realUsers = [
  { name: 'Khổng Đức Mạnh', email: 'manh.khong@company.com', role: 'retail_director', location: 'Hà Nội', department_type: 'Retail' },
  { name: 'Lương Việt Anh', email: 'anh.luong@company.com', role: 'team_leader', location: 'Hà Nội', department_type: 'Kinh doanh' },
  { name: 'Lê Khánh Duy', email: 'duy.le@company.com', role: 'employee', location: 'Hà Nội', department_type: 'Sale' },
  { name: 'Quản Thu Hà', email: 'ha.quan@company.com', role: 'employee', location: 'Hà Nội', department_type: 'Sale' },
  { name: 'Nguyễn Thị Thảo', email: 'thao.nguyen@company.com', role: 'team_leader', location: 'Hà Nội', department_type: 'Kinh doanh' },
  { name: 'Nguyễn Mạnh Linh', email: 'linh.nguyen@company.com', role: 'employee', location: 'Hà Nội', department_type: 'Sale' },
  { name: 'Trịnh Thị Bốn', email: 'bon.trinh@company.com', role: 'team_leader', location: 'Hà Nội', department_type: 'Kinh doanh' },
  { name: 'Phạm Thị Hương', email: 'huong.pham@company.com', role: 'team_leader', location: 'Hà Nội', department_type: 'Kinh doanh' },
  { name: 'Nguyễn Thị Nga', email: 'nga.nguyen@company.com', role: 'team_leader', location: 'Hồ Chí Minh', department_type: 'Kinh doanh' },
  { name: 'Hà Nguyễn Thanh Tuyền', email: 'tuyen.ha@company.com', role: 'employee', location: 'Hồ Chí Minh', department_type: 'Sale' },
  { name: 'Nguyễn Ngọc Việt Khanh', email: 'khanh.nguyen@company.com', role: 'team_leader', location: 'Hồ Chí Minh', department_type: 'Kinh doanh' },
  { name: 'Phùng Thị Thùy Vân', email: 'van.phung@company.com', role: 'employee', location: 'Hồ Chí Minh', department_type: 'Sale' }
];

async function forceImportViaCurl() {
  console.log('🚀 Force importing via direct curl commands...');

  try {
    // Try to insert each user individually with curl
    console.log('📥 Inserting users one by one...');
    
    for (const user of realUsers) {
      const userData = {
        name: user.name,
        email: user.email,
        password: '123456',
        password_changed: false,
        location: user.location,
        role: user.role,
        department_type: user.department_type,
        team_id: null
      };

      const curlCommand = `curl -X POST "${supabaseUrl}/rest/v1/users" \\
        -H "apikey: ${supabaseKey}" \\
        -H "Authorization: Bearer ${supabaseKey}" \\
        -H "Content-Type: application/json" \\
        -H "Prefer: return=representation" \\
        -d '${JSON.stringify(userData)}'`;

      try {
        const { stdout, stderr } = await execAsync(curlCommand);
        
        if (stderr) {
          console.log(`❌ ${user.name}: ${stderr}`);
        } else {
          const response = JSON.parse(stdout);
          if (Array.isArray(response) && response.length > 0) {
            console.log(`✅ ${user.name}: Created successfully`);
          } else {
            console.log(`⚠️  ${user.name}: ${stdout}`);
          }
        }
      } catch (error) {
        console.log(`❌ ${user.name}: ${error.message}`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Check final results
    console.log('\n🔍 Checking final results...');
    const checkCommand = `curl -X GET "${supabaseUrl}/rest/v1/users?select=name,email,role,location&order=role.desc,name" \\
      -H "apikey: ${supabaseKey}" \\
      -H "Authorization: Bearer ${supabaseKey}"`;

    const { stdout: checkResult } = await execAsync(checkCommand);
    const users = JSON.parse(checkResult);

    if (users && users.length > 0) {
      console.log(`\n✅ Success! Database now contains ${users.length} users:`);
      
      const directors = users.filter(u => u.role === 'retail_director');
      const leaders = users.filter(u => u.role === 'team_leader');
      const employees = users.filter(u => u.role === 'employee');

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

      console.log('\n🎉 Auto-import completed successfully!');
      console.log('🔑 Login with: manh.khong@company.com / 123456');
      console.log('🌐 Web app: http://localhost:3003/auth/director-login');
    } else {
      console.log('\n⚠️  Database is still empty. RLS policies are blocking all inserts.');
      console.log('📋 You will need to use Supabase Dashboard to import manually.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

forceImportViaCurl();
