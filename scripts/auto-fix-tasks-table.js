const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Extract connection details from Supabase URL
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

// PostgreSQL connection config
const client = new Client({
  host: `db.${projectRef}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || 'your-db-password',
  ssl: { rejectUnauthorized: false }
});

async function autoFixTasksTable() {
  console.log('🔧 Auto-fixing tasks table with admin privileges...');

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL');

    // 1. Drop existing tasks table with all constraints
    console.log('\n1. Dropping existing tasks table...');
    await client.query('DROP TABLE IF EXISTS tasks CASCADE;');
    console.log('✅ Dropped tasks table');

    // 2. Create new tasks table with correct schema
    console.log('\n2. Creating new tasks table...');
    const createTableSQL = `
      CREATE TABLE tasks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        work_type VARCHAR(50) DEFAULT 'other',
        priority VARCHAR(20) DEFAULT 'normal',
        status VARCHAR(50) DEFAULT 'new-requests',
        campaign_type VARCHAR(100) DEFAULT '',
        platform TEXT[] DEFAULT '{}',
        start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        end_date TIMESTAMP WITH TIME ZONE,
        due_date TIMESTAMP WITH TIME ZONE,
        created_by_id UUID NOT NULL,
        assigned_to_id UUID,
        team_id UUID,
        department VARCHAR(10) DEFAULT 'HN',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    await client.query(createTableSQL);
    console.log('✅ Created tasks table');

    // 3. Create indexes
    console.log('\n3. Creating indexes...');
    const indexes = [
      'CREATE INDEX idx_tasks_created_by ON tasks(created_by_id);',
      'CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_id);',
      'CREATE INDEX idx_tasks_team ON tasks(team_id);',
      'CREATE INDEX idx_tasks_status ON tasks(status);',
      'CREATE INDEX idx_tasks_department ON tasks(department);'
    ];

    for (const indexSQL of indexes) {
      await client.query(indexSQL);
    }
    console.log('✅ Created indexes');

    // 4. Disable RLS and grant permissions
    console.log('\n4. Setting permissions...');
    await client.query('ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;');
    await client.query('GRANT ALL ON tasks TO anon, authenticated;');
    console.log('✅ Set permissions');

    // 5. Test insert
    console.log('\n5. Testing task creation...');
    const testTaskSQL = `
      INSERT INTO tasks (
        name, description, work_type, priority, status,
        created_by_id, assigned_to_id, team_id, department
      ) VALUES (
        'Auto-Fix Test Task',
        'Task created by auto-fix script',
        'other', 'normal', 'new-requests',
        '6be99296-c122-457c-a7e6-2c5af3f78d44',
        '6be99296-c122-457c-a7e6-2c5af3f78d44',
        '018c0ab7-bf40-4b45-8514-2de4e89bab61',
        'HN'
      ) RETURNING id, name;
    `;

    const result = await client.query(testTaskSQL);
    console.log('✅ Test task created:', result.rows[0]);

    // 6. Clean up test task
    await client.query('DELETE FROM tasks WHERE name = $1', ['Auto-Fix Test Task']);
    console.log('✅ Test task cleaned up');

    console.log('\n🎉 Tasks table auto-fix completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Dropped old tasks table with wrong foreign keys');
    console.log('   ✅ Created new tasks table with correct schema');
    console.log('   ✅ Added indexes for performance');
    console.log('   ✅ Disabled RLS and granted permissions');
    console.log('   ✅ Tested task creation successfully');

    console.log('\n🔧 Now test in browser:');
    console.log('   1. Login: duy.le@company.com / 123456');
    console.log('   2. Go to Work tab');
    console.log('   3. Click "Tạo công việc mới"');
    console.log('   4. Fill form and submit');

  } catch (error) {
    console.error('❌ Auto-fix failed:', error.message);
    
    if (error.message.includes('password authentication failed')) {
      console.log('\n💡 Database password issue. Trying alternative method...');
      
      // Try using Supabase client instead
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, serviceKey);
      
      try {
        // Use service role to create a simple function and call it
        console.log('🔄 Trying alternative method with Supabase client...');
        
        // Test if we can at least query
        const { data, error } = await supabase.from('tasks').select('*').limit(1);
        if (error) {
          console.error('❌ Supabase client error:', error);
        } else {
          console.log('✅ Supabase client works, but need manual SQL execution');
          console.log('\n🚨 MANUAL STEP REQUIRED:');
          console.log('   Go to: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql');
          console.log('   Run: scripts/simple-tasks-table.sql');
        }
      } catch (supabaseError) {
        console.error('❌ Supabase client also failed:', supabaseError);
      }
    }
  } finally {
    await client.end();
  }
}

autoFixTasksTable();
