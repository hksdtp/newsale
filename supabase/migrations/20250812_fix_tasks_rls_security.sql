-- 🚨 CRITICAL SECURITY FIX: Fix RLS policies for tasks table
-- This migration fixes the security vulnerability where all users can see all tasks

-- 1. Drop the insecure policy
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all operations on tasks" ON tasks;

-- 2. Create a function to get current user ID from custom auth
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Try to get user ID from JWT claims first (if using Supabase Auth)
  user_id := auth.uid();
  
  -- If no Supabase auth, return NULL (will be handled by application logic)
  -- The application should set user context through other means
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create secure RLS policies for tasks

-- Policy 1: Users can view tasks they created
CREATE POLICY "Users can view their own created tasks" ON tasks
  FOR SELECT USING (
    created_by_id::text = get_current_user_id()::text
  );

-- Policy 2: Users can view tasks assigned to them  
CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (
    assigned_to_id::text = get_current_user_id()::text
  );

-- Policy 3: Users can view public tasks in their department
CREATE POLICY "Users can view public tasks in same department" ON tasks
  FOR SELECT USING (
    share_scope = 'public' AND
    department IN (
      SELECT CASE 
        WHEN location = 'Hà Nội' THEN 'HN'
        ELSE 'HCM'
      END
      FROM users 
      WHERE id::text = get_current_user_id()::text
    )
  );

-- Policy 4: Users can view team tasks in their team
CREATE POLICY "Users can view team tasks in same team" ON tasks
  FOR SELECT USING (
    share_scope = 'team' AND
    team_id IN (
      SELECT team_id 
      FROM users 
      WHERE id::text = get_current_user_id()::text
    )
  );

-- Policy 5: Directors can view all tasks (retail_director role)
CREATE POLICY "Directors can view all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = get_current_user_id()::text 
      AND role = 'retail_director'
    )
  );

-- INSERT policies
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    created_by_id::text = get_current_user_id()::text
  );

-- UPDATE policies  
CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (
    created_by_id::text = get_current_user_id()::text
  );

CREATE POLICY "Assigned users can update task status" ON tasks
  FOR UPDATE USING (
    assigned_to_id::text = get_current_user_id()::text
  );

-- DELETE policies
CREATE POLICY "Users can delete their own tasks" ON tasks
  FOR DELETE USING (
    created_by_id::text = get_current_user_id()::text
  );

CREATE POLICY "Directors can delete any task" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = get_current_user_id()::text 
      AND role = 'retail_director'
    )
  );

-- 4. Create a function to set user context for custom auth
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS void AS $$
BEGIN
  -- Set a custom setting that can be used in RLS policies
  PERFORM set_config('app.current_user_id', user_uuid::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create alternative policies using custom context (for custom auth)
-- These will be used when Supabase Auth is not available

CREATE POLICY "Custom auth: Users can view their own created tasks" ON tasks
  FOR SELECT USING (
    created_by_id::text = current_setting('app.current_user_id', true)
  );

CREATE POLICY "Custom auth: Users can view assigned tasks" ON tasks
  FOR SELECT USING (
    assigned_to_id::text = current_setting('app.current_user_id', true)
  );

-- 6. Add comments for documentation
COMMENT ON FUNCTION get_current_user_id() IS 'Gets current user ID from Supabase Auth or returns NULL for custom auth';
COMMENT ON FUNCTION set_user_context(UUID) IS 'Sets user context for custom authentication systems';

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_current_user_id() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION set_user_context(UUID) TO authenticated, anon;
