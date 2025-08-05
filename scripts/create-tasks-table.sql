-- Create or update tasks table with correct schema

-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS tasks CASCADE;

-- Create tasks table with all required columns
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  work_type VARCHAR(50) DEFAULT 'other',
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  status VARCHAR(50) DEFAULT 'new-requests' CHECK (status IN ('new-requests', 'approved', 'live')),
  campaign_type VARCHAR(100) DEFAULT '',
  platform TEXT[] DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  created_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  department VARCHAR(10) DEFAULT 'HN' CHECK (department IN ('HN', 'HCM')),
  share_scope VARCHAR(20) DEFAULT 'team' CHECK (share_scope IN ('team', 'private', 'public')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_tasks_created_by ON tasks(created_by_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_team ON tasks(team_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_department ON tasks(department);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Disable RLS for now (we'll add proper policies later)
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON tasks TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Insert a test task to verify schema
INSERT INTO tasks (
  name,
  description,
  work_type,
  priority,
  status,
  created_by_id,
  assigned_to_id,
  team_id,
  department,
  share_scope
) VALUES (
  'Test Task - Schema Verification',
  'This is a test task to verify the schema is working correctly',
  'other',
  'normal',
  'new-requests',
  (SELECT id FROM users WHERE email = 'duy.le@company.com' LIMIT 1),
  (SELECT id FROM users WHERE email = 'duy.le@company.com' LIMIT 1),
  (SELECT team_id FROM users WHERE email = 'duy.le@company.com' LIMIT 1),
  'HN',
  'team'
);

-- Verify the test task was created
SELECT 
  t.id,
  t.name,
  t.status,
  u1.name as created_by,
  u2.name as assigned_to,
  tm.name as team_name
FROM tasks t
LEFT JOIN users u1 ON t.created_by_id = u1.id
LEFT JOIN users u2 ON t.assigned_to_id = u2.id
LEFT JOIN teams tm ON t.team_id = tm.id
WHERE t.name LIKE 'Test Task%';
