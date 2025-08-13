-- Quick fix for teams access

-- Allow reading teams
CREATE POLICY "Allow read teams" ON teams
  FOR SELECT USING (true);

-- Allow reading users  
CREATE POLICY "Allow read users" ON users
  FOR SELECT USING (true);
