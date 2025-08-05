-- Create schedule_assignments table for weekly showroom schedule management
CREATE TABLE IF NOT EXISTS schedule_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  employee_name TEXT NOT NULL,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL, -- '8h-17h30', '17h30-10h', etc.
  location TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_employee_id ON schedule_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_date ON schedule_assignments(date);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_location ON schedule_assignments(location);
CREATE INDEX IF NOT EXISTS idx_schedule_assignments_date_time ON schedule_assignments(date, time_slot);

-- Add RLS (Row Level Security)
ALTER TABLE schedule_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all schedule assignments (for transparency)
CREATE POLICY "Users can view schedule assignments" ON schedule_assignments
  FOR SELECT USING (true);

-- Policy: Only Khổng Đức Mạnh can insert/update/delete schedule assignments
CREATE POLICY "Admin can manage schedule assignments" ON schedule_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND (users.name = 'Khổng Đức Mạnh' OR users.email = 'manh.khong@company.com')
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_schedule_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schedule_assignments_updated_at
  BEFORE UPDATE ON schedule_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_assignments_updated_at();

-- Insert sample data for testing
INSERT INTO schedule_assignments (employee_id, employee_name, date, time_slot, location, created_by) VALUES
  ('user1', 'Linh', '2025-01-06', '8h-17h30', 'Showroom A', 'admin'),
  ('user2', 'Hương', '2025-01-06', '17h30-10h', 'Showroom B', 'admin'),
  ('user3', 'Thảo', '2025-01-07', '8h30-18h', 'Showroom A', 'admin'),
  ('user4', 'Duy', '2025-01-07', '9h-17h30', 'Showroom B', 'admin'),
  ('user1', 'Linh', '2025-01-08', '8h-17h30', 'Showroom A', 'admin'),
  ('user5', 'Việt Anh', '2025-01-08', '17h30-10h', 'Showroom B', 'admin');

COMMENT ON TABLE schedule_assignments IS 'Weekly showroom schedule assignments managed by Khổng Đức Mạnh';
COMMENT ON COLUMN schedule_assignments.employee_id IS 'Reference to users table';
COMMENT ON COLUMN schedule_assignments.employee_name IS 'Employee name for display (denormalized for performance)';
COMMENT ON COLUMN schedule_assignments.date IS 'Work date';
COMMENT ON COLUMN schedule_assignments.time_slot IS 'Time slot like 8h-17h30, 17h30-10h';
COMMENT ON COLUMN schedule_assignments.location IS 'Showroom location';
COMMENT ON COLUMN schedule_assignments.created_by IS 'User who created this assignment (should be admin)';
