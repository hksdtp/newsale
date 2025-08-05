const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createRetailDirector() {
  console.log('🚀 Creating retail director...');

  try {
    // Check if retail director already exists
    const { data: existingDirectors, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'retail_director');

    if (checkError) {
      console.error('❌ Error checking existing directors:', checkError);
      return;
    }

    if (existingDirectors && existingDirectors.length > 0) {
      console.log('✅ Retail director already exists:');
      existingDirectors.forEach(director => {
        console.log(`   - ${director.name} (${director.email})`);
      });
      return;
    }

    // Create retail director without team_id to avoid RLS issues
    const retailDirector = {
      name: 'Khổng Đức Mạnh',
      email: 'manh.khong@company.com',
      password: '123456',
      password_changed: false,
      team_id: null,
      location: 'Hà Nội',
      role: 'retail_director',
      department_type: 'Retail'
    };

    const { data: insertedDirector, error: insertError } = await supabase
      .from('users')
      .insert([retailDirector])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error creating retail director:', insertError);
      return;
    }

    console.log('✅ Retail director created successfully!');
    console.log(`   Name: ${insertedDirector.name}`);
    console.log(`   Email: ${insertedDirector.email}`);
    console.log(`   Role: ${insertedDirector.role}`);
    console.log(`   Department: ${insertedDirector.department_type}`);
    console.log(`   Location: ${insertedDirector.location}`);
    console.log(`   Password: 123456`);

    console.log('\n🎉 You can now login as retail director!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createRetailDirector();
