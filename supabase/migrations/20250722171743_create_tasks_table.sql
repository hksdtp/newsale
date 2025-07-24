-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  work_type VARCHAR(50) DEFAULT 'other' CHECK (work_type IN (
    'other', 'sbg-new', 'sbg-old', 'partner-new', 'partner-old',
    'kts-new', 'kts-old', 'customer-new', 'customer-old'
  )),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  status VARCHAR(30) DEFAULT 'new-requests' CHECK (status IN ('new-requests', 'approved', 'live')),
  campaign_type VARCHAR(100),
  platform TEXT[], -- Array of platforms
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  due_date DATE,
  created_by_id UUID REFERENCES members(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES members(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  department VARCHAR(10) NOT NULL DEFAULT 'HN' CHECK (department IN ('HN', 'HCM')),
  share_scope VARCHAR(20) DEFAULT 'team' CHECK (share_scope IN ('team', 'private', 'public')),
  is_completed BOOLEAN DEFAULT false,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_work_type ON tasks(work_type);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_id ON tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_id ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department);
CREATE INDEX IF NOT EXISTS idx_tasks_share_scope ON tasks(share_scope);
CREATE INDEX IF NOT EXISTS idx_tasks_start_date ON tasks(start_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority);
CREATE INDEX IF NOT EXISTS idx_tasks_department_status ON tasks(department, status);
CREATE INDEX IF NOT EXISTS idx_tasks_team_status ON tasks(team_id, status);

-- Enable RLS (Row Level Security)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for tasks
CREATE POLICY "Allow all operations on tasks" ON tasks
  FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add constraint to ensure due_date is after start_date
ALTER TABLE tasks ADD CONSTRAINT check_due_date_after_start_date
  CHECK (due_date IS NULL OR due_date >= start_date);