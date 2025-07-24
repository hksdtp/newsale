const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTasksTable() {
  console.log('🚀 Creating tasks table...');

  try {
    // First, let's check if tasks table exists
    const { data: existingTasks, error: checkError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);

    if (!checkError) {
      console.log('✅ Tasks table already exists!');
      console.log('📊 Sample data:', existingTasks);
      return;
    }

    console.log('📝 Tasks table does not exist, creating...');

    // Create a simple task manually to test
    const testTask = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Task',
      description: 'This is a test task',
      work_type: 'other',
      priority: 'normal',
      status: 'new-requests',
      created_at: new Date().toISOString()
    };

    // Try to insert test data
    const { data, error } = await supabase
      .from('tasks')
      .insert(testTask)
      .select();

    if (error) {
      console.error('❌ Error creating task:', error);
      
      // If table doesn't exist, we need to create it via SQL
      console.log('🔧 Attempting to create table via SQL...');
      
      // Note: This requires database admin access
      console.log('⚠️  Please create the tasks table manually in Supabase dashboard:');
      console.log(`
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  work_type VARCHAR(50) NOT NULL DEFAULT 'other',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(50) NOT NULL DEFAULT 'new-requests',
  campaign_type VARCHAR(100),
  platform TEXT[],
  start_date DATE,
  end_date DATE,
  due_date DATE,
  created_by_id UUID,
  assigned_to_id UUID,
  team_id UUID,
  department VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `);
      
    } else {
      console.log('✅ Test task created successfully:', data);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createTasksTable();
