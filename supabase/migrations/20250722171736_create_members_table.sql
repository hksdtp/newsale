-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  location VARCHAR(10) NOT NULL CHECK (location IN ('HN', 'HCM')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_members_team_id ON members(team_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_location ON members(location);
CREATE INDEX IF NOT EXISTS idx_members_role ON members(role);

-- Enable RLS (Row Level Security)
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Create policy for members
CREATE POLICY "Allow all operations on members" ON members
  FOR ALL USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();