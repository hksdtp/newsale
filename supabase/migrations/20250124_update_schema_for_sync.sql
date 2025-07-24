-- Migration to sync database with application requirements

-- 1. Create users table (rename from members)
-- First, drop existing foreign key constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey;

-- Create users table with proper structure
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT '123456',
  password_changed BOOLEAN DEFAULT false,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  location VARCHAR(50) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'team_leader', 'retail_director')),
  department_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy data from members to users if members exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members') THEN
    INSERT INTO users (id, email, name, password, team_id, location, role, created_at, updated_at)
    SELECT 
      id,
      email,
      name,
      password_hash,
      team_id,
      CASE 
        WHEN location = 'HN' THEN 'Hà Nội'
        WHEN location = 'HCM' THEN 'Hồ Chí Minh'
        ELSE location
      END,
      CASE 
        WHEN role = 'admin' THEN 'retail_director'
        WHEN role = 'leader' THEN 'team_leader'
        ELSE 'employee'
      END,
      created_at,
      updated_at
    FROM members
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- 2. Update tasks table with missing fields
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS share_scope VARCHAR(20) DEFAULT 'team' CHECK (share_scope IN ('private', 'team', 'public'));

-- Update foreign keys to reference users table
ALTER TABLE tasks 
DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey,
DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey;

ALTER TABLE tasks
ADD CONSTRAINT tasks_created_by_id_fkey FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT tasks_assigned_to_id_fkey FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE SET NULL;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tasks_share_scope ON tasks(share_scope);

-- 4. Update RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view all users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on email" ON users
  FOR UPDATE USING (email = current_user);

-- 5. Enable RLS on tasks table
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
DROP POLICY IF EXISTS "Enable all operations on tasks" ON tasks;

CREATE POLICY "Enable all operations on tasks" ON tasks
  FOR ALL USING (true);

-- 6. Insert sample users if users table is empty
INSERT INTO users (email, name, password, team_id, location, role, department_type) 
SELECT * FROM (VALUES
  ('manh.khong@company.com', 'Khổng Đức Mạnh', '123456', 
   (SELECT id FROM teams WHERE name = 'Development Team' LIMIT 1), 
   'Hà Nội', 'retail_director', 'Retail'),
  ('an.nguyen@company.com', 'Nguyễn Văn An', '123456',
   (SELECT id FROM teams WHERE name = 'Development Team' LIMIT 1),
   'Hà Nội', 'team_leader', 'Development'),
  ('binh.tran@company.com', 'Trần Thị Bình', '123456',
   (SELECT id FROM teams WHERE name = 'Development Team' LIMIT 1),
   'Hà Nội', 'employee', 'Development'),
  ('cuong.le@company.com', 'Lê Văn Cường', '123456',
   (SELECT id FROM teams WHERE name = 'Marketing Team' LIMIT 1),
   'Hồ Chí Minh', 'team_leader', 'Marketing'),
  ('dung.pham@company.com', 'Phạm Thị Dung', '123456',
   (SELECT id FROM teams WHERE name = 'Marketing Team' LIMIT 1),
   'Hồ Chí Minh', 'employee', 'Marketing')
) AS v(email, name, password, team_id, location, role, department_type)
WHERE NOT EXISTS (SELECT 1 FROM users);

-- 7. Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Drop members table if it exists (after data migration)
DROP TABLE IF EXISTS members CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
END $$;
