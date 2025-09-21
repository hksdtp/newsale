-- Migration: Add test function for task creation with context
-- Created: 2025-09-21
-- Purpose: Test RLS policies and user context in same transaction

CREATE OR REPLACE FUNCTION create_task_with_context(
  user_uuid UUID,
  task_name TEXT,
  task_description TEXT DEFAULT '',
  work_type_val TEXT DEFAULT 'other',
  priority_val TEXT DEFAULT 'normal',
  department_val TEXT DEFAULT 'HN'
)
RETURNS UUID AS $$
DECLARE
  new_task_id UUID;
  test_user RECORD;
BEGIN
  -- Set user context
  PERFORM set_config('app.current_user_id', user_uuid::TEXT, true);
  
  -- Get user info
  SELECT * INTO test_user FROM users WHERE id = user_uuid;
  
  IF test_user IS NULL THEN
    RAISE EXCEPTION 'User not found: %', user_uuid;
  END IF;
  
  -- Create task
  INSERT INTO tasks (
    name,
    description,
    work_type,
    priority,
    status,
    start_date,
    created_by_id,
    assigned_to_id,
    team_id,
    department,
    share_scope,
    source
  ) VALUES (
    task_name,
    task_description,
    work_type_val,
    priority_val,
    'new-requests',
    CURRENT_DATE,
    user_uuid,
    user_uuid,
    test_user.team_id,
    department_val,
    'team',
    'manual'
  ) RETURNING id INTO new_task_id;
  
  RETURN new_task_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
