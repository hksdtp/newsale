-- Fix foreign key constraint error for tasks table
-- Error: constraint "tasks_created_by_id_fkey" for relation "tasks" already exists

-- Step 1: Drop ALL existing foreign key constraints for tasks table
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey CASCADE;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey CASCADE;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_team_id_fkey CASCADE;

-- Step 2: Verify all constraints are dropped
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='tasks';

-- Step 3: Add new foreign key constraints (optional - only if needed)
-- Uncomment these lines if you want to add the constraints back
/*
ALTER TABLE tasks 
ADD CONSTRAINT tasks_created_by_id_fkey 
FOREIGN KEY (created_by_id) 
REFERENCES users(id) 
ON DELETE SET NULL;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_assigned_to_id_fkey 
FOREIGN KEY (assigned_to_id) 
REFERENCES users(id) 
ON DELETE SET NULL;

ALTER TABLE tasks 
ADD CONSTRAINT tasks_team_id_fkey 
FOREIGN KEY (team_id) 
REFERENCES teams(id) 
ON DELETE SET NULL;
*/

-- Step 4: Test insert
INSERT INTO tasks (
    name, 
    description, 
    work_type, 
    priority, 
    status, 
    created_by_id, 
    assigned_to_id, 
    team_id, 
    department
)
VALUES (
    'Test Task After Fix', 
    'Testing after dropping constraints', 
    'other', 
    'normal', 
    'new-requests', 
    '6be99296-c122-457c-a7e6-2c5af3f78d44', 
    '6be99296-c122-457c-a7e6-2c5af3f78d44', 
    '018c0ab7-bf40-4b45-8514-2de4e89bab61', 
    'HN'
);

-- If insert is successful, you can delete the test task
-- DELETE FROM tasks WHERE name = 'Test Task After Fix';
