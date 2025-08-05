-- Add share_scope column to tasks table
ALTER TABLE tasks 
ADD COLUMN share_scope VARCHAR(20) DEFAULT 'team' CHECK (share_scope IN ('private', 'team', 'public'));

-- Update existing tasks to have appropriate share_scope
UPDATE tasks SET share_scope = 'team' WHERE share_scope IS NULL;

-- Create index for better performance
CREATE INDEX idx_tasks_share_scope ON tasks(share_scope);

-- Comments
COMMENT ON COLUMN tasks.share_scope IS 'Phạm vi chia sẻ: private (chỉ mình tôi), team (trong nhóm), public (toàn công ty)';
