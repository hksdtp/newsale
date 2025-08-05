-- Add share_scope column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS share_scope VARCHAR(20) DEFAULT 'team';

-- Add check constraint to ensure valid values
ALTER TABLE tasks 
ADD CONSTRAINT check_share_scope 
CHECK (share_scope IN ('private', 'team', 'public'));

-- Update existing tasks to have appropriate share_scope values
-- This is a sample logic - you may need to adjust based on your business rules
UPDATE tasks 
SET share_scope = CASE 
    WHEN team_id IS NULL THEN 'private'  -- Tasks without team are private
    WHEN department IS NOT NULL THEN 'public'  -- Department-wide tasks are public
    ELSE 'team'  -- Default to team scope
END
WHERE share_scope IS NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_share_scope ON tasks(share_scope);

-- Optional: Add comments for documentation
COMMENT ON COLUMN tasks.share_scope IS 'Scope of task visibility: private (only creator/assignee), team (team members), public (department-wide)';
