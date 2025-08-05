-- Fix RLS policies to prevent infinite recursion

-- 1. Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on teams" ON teams;
DROP POLICY IF EXISTS "Allow all operations on members" ON members;

-- 2. Disable RLS temporarily to clean up
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- 3. Check if members table exists and disable RLS
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members') THEN
        ALTER TABLE members DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Create simple, non-recursive policies

-- Users table: Allow all operations for anon and authenticated users
CREATE POLICY "users_select_policy" ON users
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "users_insert_policy" ON users
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "users_update_policy" ON users
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "users_delete_policy" ON users
    FOR DELETE TO anon, authenticated
    USING (true);

-- Teams table: Allow all operations for anon and authenticated users
CREATE POLICY "teams_select_policy" ON teams
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "teams_insert_policy" ON teams
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "teams_update_policy" ON teams
    FOR UPDATE TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "teams_delete_policy" ON teams
    FOR DELETE TO anon, authenticated
    USING (true);

-- Members table (if exists): Allow all operations
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members') THEN
        EXECUTE 'CREATE POLICY "members_select_policy" ON members
            FOR SELECT TO anon, authenticated
            USING (true)';
        
        EXECUTE 'CREATE POLICY "members_insert_policy" ON members
            FOR INSERT TO anon, authenticated
            WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "members_update_policy" ON members
            FOR UPDATE TO anon, authenticated
            USING (true)
            WITH CHECK (true)';
        
        EXECUTE 'CREATE POLICY "members_delete_policy" ON members
            FOR DELETE TO anon, authenticated
            USING (true)';
    END IF;
END $$;

-- 5. Re-enable RLS with new policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS for members table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members') THEN
        ALTER TABLE members ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 6. Grant necessary permissions
GRANT ALL ON users TO anon, authenticated;
GRANT ALL ON teams TO anon, authenticated;

-- Grant permissions on members table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members') THEN
        EXECUTE 'GRANT ALL ON members TO anon, authenticated';
    END IF;
END $$;

-- 7. Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
