-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teams table
CREATE TABLE teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create members table
CREATE TABLE members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_first_login BOOLEAN DEFAULT TRUE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  work_type VARCHAR(50) NOT NULL DEFAULT 'other',
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  status VARCHAR(50) NOT NULL DEFAULT 'new-requests',
  campaign_type VARCHAR(100),
  platform TEXT[], -- Array of platforms
  start_date DATE,
  end_date DATE,
  due_date DATE,
  created_by_id UUID REFERENCES members(id) ON DELETE SET NULL,
  assigned_to_id UUID REFERENCES members(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  department VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_team_id ON members(team_id);
CREATE INDEX idx_locations_team_id ON locations(team_id);
CREATE INDEX idx_tasks_created_by ON tasks(created_by_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_work_type ON tasks(work_type);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO teams (name, description) VALUES 
('Development Team', 'Main development team'),
('Marketing Team', 'Marketing and sales team');

INSERT INTO locations (name, address, team_id) VALUES 
('Hà Nội Office', '123 Đường ABC, Hà Nội', (SELECT id FROM teams WHERE name = 'Development Team')),
('TP.HCM Office', '456 Đường XYZ, TP.HCM', (SELECT id FROM teams WHERE name = 'Development Team')),
('Remote', 'Work from home', (SELECT id FROM teams WHERE name = 'Development Team'));

-- Insert sample members with default password "123456"
-- For demo purposes, storing plain text (in production, use proper hashing)
INSERT INTO members (email, name, team_id, location_id, password_hash, role) VALUES
('admin@company.com', 'Admin User',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Hà Nội Office'),
  '123456', -- default password
  'admin'),
('nguyen@company.com', 'Nguyễn Văn A',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Hà Nội Office'),
  '123456', -- default password
  'member'),
('tran@company.com', 'Trần Thị B',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'TP.HCM Office'),
  '123456', -- default password
  'member'),
('le@company.com', 'Lê Văn C',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Remote'),
  '123456', -- default password
  'member'),
('pham@company.com', 'Phạm Văn D',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Hà Nội Office'),
  '123456', -- default password
  'member'),
('hoang@company.com', 'Hoàng Thị E',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'TP.HCM Office'),
  '123456', -- default password
  'member'),
('vu@company.com', 'Vũ Văn F',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Remote'),
  '123456', -- default password
  'member'),
('do@company.com', 'Đỗ Thị G',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Hà Nội Office'),
  '123456', -- default password
  'member'),
('bui@company.com', 'Bùi Văn H',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'TP.HCM Office'),
  '123456', -- default password
  'member'),
('dang@company.com', 'Đặng Thị I',
  (SELECT id FROM teams WHERE name = 'Development Team'),
  (SELECT id FROM locations WHERE name = 'Remote'),
  '123456', -- default password
  'member');

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Teams: Members can only see their own team
CREATE POLICY "Members can view their own team" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM members 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Locations: Members can only see locations in their team
CREATE POLICY "Members can view team locations" ON locations
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM members 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Members: Members can view other members in their team
CREATE POLICY "Members can view team members" ON members
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM members 
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Members can update their own profile
CREATE POLICY "Members can update own profile" ON members
  FOR UPDATE USING (email = auth.jwt() ->> 'email');
