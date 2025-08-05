-- Verify share_scope column and data

-- Check if column exists
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'tasks' AND column_name = 'share_scope';

-- Count tasks by share_scope
SELECT share_scope, COUNT(*) as count
FROM tasks
GROUP BY share_scope
ORDER BY share_scope;

-- View sample tasks with their share_scope
SELECT id, name, created_by_id, assigned_to_id, team_id, department, share_scope
FROM tasks
LIMIT 10;

-- Update specific tasks to different scopes (examples)
-- Make tasks created by directors public
UPDATE tasks
SET share_scope = 'public'
WHERE created_by_id IN (
    SELECT id FROM users WHERE role = 'retail_director'
);

-- Make personal tasks private
UPDATE tasks
SET share_scope = 'private'
WHERE assigned_to_id = created_by_id 
  AND team_id IS NULL;

-- Verify the distribution after updates
SELECT 
    share_scope,
    COUNT(*) as total_tasks,
    COUNT(DISTINCT created_by_id) as unique_creators,
    COUNT(DISTINCT team_id) as unique_teams
FROM tasks
GROUP BY share_scope;
