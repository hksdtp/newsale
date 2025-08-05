-- Fix foreign key constraints for tasks table
-- This script updates the foreign key constraints to reference the users table instead of members

-- Step 1: Drop existing foreign key constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey;

-- Step 2: Add new foreign key constraints pointing to users table
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

-- Step 3: Verify the constraints
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
