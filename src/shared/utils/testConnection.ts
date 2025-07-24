import { supabase } from '../api/supabase';

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('teams')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, name')
      .limit(3);

    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
      return false;
    }

    console.log('✅ Users table accessible');
    console.log('👥 Sample users:', users?.map(u => u.name).join(', '));
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Auto-test connection in development
// if (import.meta.env.DEV) {
//   testSupabaseConnection();
// }
