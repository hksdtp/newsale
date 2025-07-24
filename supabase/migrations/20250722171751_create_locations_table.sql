-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL CHECK (code IN ('HN', 'HCM')),
  name VARCHAR(100) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default locations
INSERT INTO locations (code, name, full_name) VALUES
  ('HN', 'Hà Nội', 'Thành phố Hà Nội'),
  ('HCM', 'Hồ Chí Minh', 'Thành phố Hồ Chí Minh')
ON CONFLICT (code) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_locations_code ON locations(code);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Create policy for locations (read-only for most users)
CREATE POLICY "Allow read access to locations" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations on locations for admin" ON locations
  FOR ALL USING (true); -- In production, this should be restricted to admin users

-- Add trigger for updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();