-- Create permissive RLS policies to allow all operations

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
DROP POLICY IF EXISTS "Allow all operations on teams" ON teams;

-- Create permissive policies for users table
CREATE POLICY "Allow all operations on users" ON users
FOR ALL 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Create permissive policies for teams table (if exists)
CREATE POLICY "Allow all operations on teams" ON teams
FOR ALL 
TO anon, authenticated  
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled but with permissive policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
