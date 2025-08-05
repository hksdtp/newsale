-- Rollback script to remove share_scope column if needed

-- Drop the index first
DROP INDEX IF EXISTS idx_tasks_share_scope;

-- Drop the constraint
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS check_share_scope;

-- Drop the column
ALTER TABLE tasks 
DROP COLUMN IF EXISTS share_scope;
