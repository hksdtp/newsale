-- Migration: Fix tasks table foreign keys to reference users instead of members
-- Created: 2025-09-21
-- Issue: Tasks table is referencing members table but app uses users table

-- 1. Drop existing foreign key constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey;

-- 2. Add new foreign key constraints referencing users table
ALTER TABLE tasks 
ADD CONSTRAINT tasks_created_by_id_fkey 
FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_assigned_to_id_fkey 
FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Update RLS policies to use consistent user ID functions
-- Drop old policies that might be inconsistent
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own created tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view team tasks in same team" ON tasks;
DROP POLICY IF EXISTS "Users can view public tasks in same department" ON tasks;
DROP POLICY IF EXISTS "Directors can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON tasks;
DROP POLICY IF EXISTS "Assigned users can update task status" ON tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON tasks;
DROP POLICY IF EXISTS "Directors can delete any task" ON tasks;

-- Create comprehensive RLS policies
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    created_by_id::text = get_current_user_id()::text
  );

CREATE POLICY "Users can view their own created tasks" ON tasks
  FOR SELECT USING (
    created_by_id::text = get_current_user_id()::text
  );

CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (
    assigned_to_id::text = get_current_user_id()::text
  );

CREATE POLICY "Users can view team tasks in same team" ON tasks
  FOR SELECT USING (
    share_scope = 'team' AND team_id IN (
      SELECT team_id FROM users WHERE id::text = get_current_user_id()::text
    )
  );

CREATE POLICY "Users can view public tasks in same department" ON tasks
  FOR SELECT USING (
    share_scope = 'public' AND department IN (
      SELECT CASE
        WHEN location = 'Hà Nội' THEN 'HN'
        ELSE 'HCM'
      END
      FROM users WHERE id::text = get_current_user_id()::text
    )
  );

CREATE POLICY "Directors can view all tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id::text = get_current_user_id()::text
      AND role = 'retail_director'
    )
  );

CREATE POLICY "Users can update their own tasks" ON tasks
  FOR UPDATE USING (
    created_by_id::text = get_current_user_id()::text
  );

CREATE POLICY "Assigned users can update task status" ON tasks
  FOR UPDATE USING (
    assigned_to_id::text = get_current_user_id()::text
  );

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

-- 4. Create or replace the get_current_user_id function if it doesn't exist
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS UUID AS $$
BEGIN
  -- Try to get from app.current_user_id setting first
  BEGIN
    RETURN current_setting('app.current_user_id', true)::UUID;
  EXCEPTION WHEN OTHERS THEN
    -- Fallback to auth.uid() if available
    BEGIN
      RETURN auth.uid();
    EXCEPTION WHEN OTHERS THEN
      -- Return NULL if neither is available
      RETURN NULL;
    END;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add comments for documentation
COMMENT ON CONSTRAINT tasks_created_by_id_fkey ON tasks IS 'References users table instead of members';
COMMENT ON CONSTRAINT tasks_assigned_to_id_fkey ON tasks IS 'References users table instead of members';
COMMENT ON FUNCTION get_current_user_id() IS 'Gets current user ID from app setting or auth context';
