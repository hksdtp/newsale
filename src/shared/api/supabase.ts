import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fnakxavwxubnbucfoujd.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with optimized settings
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  // 🚀 Performance optimizations
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-client-info': 'newsale-webapp',
    },
  },
  // 🔧 Connection settings để giảm timeout
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 🔍 Connection health check utility
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('tasks').select('id').limit(1).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned (OK)
      console.error('❌ Supabase connection check failed:', error);
      return false;
    }

    console.log('✅ Supabase connection healthy');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection check error:', error);
    return false;
  }
};

// 🚀 Connection retry utility
export const withConnectionRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check connection health before operation
      if (attempt > 1) {
        const isHealthy = await checkSupabaseConnection();
        if (!isHealthy) {
          throw new Error('Database connection unhealthy');
        }
      }

      return await operation();
    } catch (error) {
      console.error(`❌ Operation attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
};

// Database types
export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          team_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          team_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          team_id?: string;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          email: string;
          name: string;
          team_id: string;
          location_id: string | null;
          password_hash: string;
          is_first_login: boolean;
          role: 'admin' | 'member';
          created_at: string;
          updated_at: string;
          last_login: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          team_id: string;
          location_id?: string | null;
          password_hash: string;
          is_first_login?: boolean;
          role?: 'admin' | 'member';
          created_at?: string;
          updated_at?: string;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          team_id?: string;
          location_id?: string | null;
          password_hash?: string;
          is_first_login?: boolean;
          role?: 'admin' | 'member';
          updated_at?: string;
          last_login?: string | null;
        };
      };
    };
  };
}
