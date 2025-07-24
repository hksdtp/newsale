-- Add share_scope column to tasks table
-- Run this in Supabase SQL Editor

-- Add share_scope column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'tasks' AND column_name = 'share_scope') THEN
    ALTER TABLE tasks ADD COLUMN share_scope VARCHAR(20) DEFAULT 'team' 
    CHECK (share_scope IN ('private', 'team', 'public'));
    
    RAISE NOTICE '✅ Added share_scope column to tasks table';
  ELSE
    RAISE NOTICE 'ℹ️ share_scope column already exists';
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_share_scope ON tasks(share_scope);

-- Update existing tasks to have default share_scope
UPDATE tasks SET share_scope = 'team' WHERE share_scope IS NULL;

-- Verify the change
DO $$
DECLARE
  col_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'share_scope'
  ) INTO col_exists;
  
  IF col_exists THEN
    RAISE NOTICE '✅ Column share_scope successfully added to tasks table';
  ELSE
    RAISE NOTICE '❌ Failed to add share_scope column';
  END IF;
END $$;
