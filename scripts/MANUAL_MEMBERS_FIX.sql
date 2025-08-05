
-- MANUAL FIX: Add user to members table
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql

-- Add Lê Khánh Duy to members table
INSERT INTO members (id, name, email, team_id, role, active) 
VALUES (
  '6be99296-c122-457c-a7e6-2c5af3f78d44',
  'Lê Khánh Duy', 
  'duy.le@company.com',
  '018c0ab7-bf40-4b45-8514-2de4e89bab61',
  'employee',
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  team_id = EXCLUDED.team_id,
  role = EXCLUDED.role,
  active = EXCLUDED.active;

-- Test task creation
INSERT INTO tasks (name, description, work_type, priority, status, created_by_id, assigned_to_id, team_id, department)
VALUES (
  'Manual Members Fix Test',
  'Testing after adding user to members table',
  'other',
  'normal', 
  'new-requests',
  '6be99296-c122-457c-a7e6-2c5af3f78d44',
  '6be99296-c122-457c-a7e6-2c5af3f78d44',
  '018c0ab7-bf40-4b45-8514-2de4e89bab61',
  'HN'
);

-- Verify task was created
SELECT id, name, created_by_id, created_at FROM tasks WHERE name = 'Manual Members Fix Test';

-- Clean up test task
DELETE FROM tasks WHERE name = 'Manual Members Fix Test';
  