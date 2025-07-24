import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

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
