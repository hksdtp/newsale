-- Create simple tasks table without foreign key constraints for now

-- Drop existing tasks table
DROP TABLE IF EXISTS tasks CASCADE;

-- Create simple tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  work_type VARCHAR(50) DEFAULT 'other',
  priority VARCHAR(20) DEFAULT 'normal',
  status VARCHAR(50) DEFAULT 'new-requests',
  campaign_type VARCHAR(100) DEFAULT '',
  platform TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by_id UUID NOT NULL,
  assigned_to_id UUID,
  team_id UUID,
  department VARCHAR(10) DEFAULT 'HN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_tasks_created_by ON tasks(created_by_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_team ON tasks(team_id);
CREATE INDEX idx_tasks_status ON tasks(status);

-- Disable RLS
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON tasks TO anon, authenticated;

-- Test insert
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
) VALUES (
  'Test Task - Simple Schema',
  'Test task without foreign key constraints',
  'other',
  'normal',
  'new-requests',
  '6be99296-c122-457c-a7e6-2c5af3f78d44',
  '6be99296-c122-457c-a7e6-2c5af3f78d44',
  '018c0ab7-bf40-4b45-8514-2de4e89bab61',
  'HN'
);

-- Verify
SELECT * FROM tasks WHERE name LIKE 'Test Task%';
