
-- MANUAL FIX FOR TASKS TABLE FOREIGN KEY ISSUE
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql

-- Option 1: Add user to members table (if members table exists)
INSERT INTO members (id, name, email) 
VALUES ('6be99296-c122-457c-a7e6-2c5af3f78d44', 'Lê Khánh Duy', 'duy.le@company.com')
ON CONFLICT (id) DO NOTHING;

-- Option 2: Drop foreign key constraints (if Option 1 doesn't work)
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_team_id_fkey;

-- Test task creation
INSERT INTO tasks (name, description, work_type, priority, status, created_by_id, assigned_to_id, team_id, department)
VALUES ('Manual Test Task', 'Testing manual fix', 'other', 'normal', 'new-requests', 
        '6be99296-c122-457c-a7e6-2c5af3f78d44', 
        '6be99296-c122-457c-a7e6-2c5af3f78d44', 
        '018c0ab7-bf40-4b45-8514-2de4e89bab61', 
        'HN');

-- Verify task was created
SELECT id, name, created_by_id, created_at FROM tasks WHERE name = 'Manual Test Task';

-- Clean up test task
DELETE FROM tasks WHERE name = 'Manual Test Task';
  