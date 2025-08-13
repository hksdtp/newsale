-- 🔧 FIX TEAMS ACCESS
-- Allow reading teams table for app functionality

-- Check current policies on teams table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'teams';

-- Drop any restrictive policies on teams table
DROP POLICY IF EXISTS "Temporary lockdown" ON teams;
DROP POLICY IF EXISTS "Block unauthorized writes" ON teams;
DROP POLICY IF EXISTS "Block unauthorized updates" ON teams;
DROP POLICY IF EXISTS "Block unauthorized deletes" ON teams;

-- Create policy to allow reading teams
CREATE POLICY "Allow read teams" ON teams
  FOR SELECT USING (true);

-- Block write operations on teams (security)
CREATE POLICY "Block team writes" ON teams
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Block team updates" ON teams  
  FOR UPDATE USING (false);

CREATE POLICY "Block team deletes" ON teams
  FOR DELETE USING (false);

-- Also check users table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Ensure users table is readable
DROP POLICY IF EXISTS "Temporary lockdown" ON users;

CREATE POLICY "Allow read users" ON users
  FOR SELECT USING (true);

-- Block write operations on users (security)  
CREATE POLICY "Block user writes" ON users
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Block user updates" ON users
  FOR UPDATE USING (false);

CREATE POLICY "Block user deletes" ON users
  FOR DELETE USING (false);
