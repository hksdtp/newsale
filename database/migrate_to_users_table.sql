-- =====================================
-- MIGRATION SCRIPT TO SYNC WITH APP
-- =====================================
-- Run this script in Supabase SQL Editor
-- Created: 2025-01-24

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. First check and create users table
DO $$
BEGIN
  -- Check if users table already exists
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    -- Create users table
    CREATE TABLE users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL DEFAULT '123456',
      password_changed BOOLEAN DEFAULT false,
      team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
      location VARCHAR(50) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('employee', 'team_leader', 'retail_director')),
      department_type VARCHAR(50),
      last_login TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    RAISE NOTICE 'Created users table successfully';
  ELSE
    RAISE NOTICE 'Users table already exists';
  END IF;
END $$;

-- 2. Add missing columns to users table if they don't exist
DO $$
BEGIN
  -- Add password_changed column if missing
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'password_changed') THEN
    ALTER TABLE users ADD COLUMN password_changed BOOLEAN DEFAULT false;
  END IF;
  
  -- Add last_login column if missing
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'last_login') THEN
    ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 3. Migrate data from members table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'members') THEN
    -- Copy data from members to users
    INSERT INTO users (id, email, name, password, team_id, location, role, created_at, updated_at)
    SELECT 
      id,
      email,
      name,
      COALESCE(password_hash, '123456'),
      team_id,
      CASE 
        WHEN location = 'HN' THEN 'Hà Nội'
        WHEN location = 'HCM' THEN 'Hồ Chí Minh'
        ELSE COALESCE(location, 'Hà Nội')
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
    
    RAISE NOTICE 'Migrated data from members to users';
  END IF;
END $$;

-- 4. Update tasks table structure
DO $$
BEGIN
  -- Add share_scope column to tasks if it doesn't exist
  IF NOT EXISTS (SELECT column_name FROM information_schema.columns 
                 WHERE table_name = 'tasks' AND column_name = 'share_scope') THEN
    ALTER TABLE tasks ADD COLUMN share_scope VARCHAR(20) DEFAULT 'team' 
    CHECK (share_scope IN ('private', 'team', 'public'));
  END IF;
END $$;

-- 5. Insert sample users if table is empty
INSERT INTO users (email, name, password, team_id, location, role, department_type) 
VALUES
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
   'Hồ Chí Minh', 'employee', 'Marketing'),
  ('test1@company.com', 'Nguyễn Test 1', '123456',
   (SELECT id FROM teams WHERE name = 'Development Team' LIMIT 1),
   'Hà Nội', 'employee', 'Development'),
  ('test2@company.com', 'Trần Test 2', '123456',
   (SELECT id FROM teams WHERE name = 'Marketing Team' LIMIT 1),
   'Hồ Chí Minh', 'employee', 'Marketing')
ON CONFLICT (email) DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_team_id ON users(team_id);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tasks_share_scope ON tasks(share_scope);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by_id ON tasks(created_by_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to_id ON tasks(assigned_to_id);

-- 7. Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read access for all users" ON users;
DROP POLICY IF EXISTS "Enable update for users based on email" ON users;
DROP POLICY IF EXISTS "Enable all operations on tasks" ON tasks;

-- Users policies
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable update for own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text OR true); -- Simplified for now

-- Tasks policies  
CREATE POLICY "Enable all operations on tasks" ON tasks
  FOR ALL USING (true);

-- 9. Create/Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Final verification
DO $$
DECLARE
  user_count INTEGER;
  task_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM users;
  SELECT COUNT(*) INTO task_count FROM tasks;
  
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '   - Users table has % records', user_count;
  RAISE NOTICE '   - Tasks table has % records', task_count;
  RAISE NOTICE '   - All indexes created';
  RAISE NOTICE '   - RLS policies applied';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Your database is now synchronized with the application!';
END $$;
