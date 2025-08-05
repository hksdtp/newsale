-- Basic setup migration - run first
-- This creates minimal structure to avoid foreign key errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create basic teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  location VARCHAR(10) DEFAULT 'HN',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create basic users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT '123456',
  password_changed BOOLEAN DEFAULT false,
  team_id UUID,
  location VARCHAR(50) NOT NULL DEFAULT 'Hà Nội',
  role VARCHAR(50) NOT NULL DEFAULT 'employee',
  department_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO teams (name, location, description) VALUES 
  ('Development Team', 'HN', 'Main development team'),
  ('Marketing Team', 'HCM', 'Marketing and sales team')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, name, password, team_id, location, role, department_type) 
SELECT * FROM (VALUES
  ('manh.khong@company.com', 'Khổng Đức Mạnh', '123456', 
   (SELECT id FROM teams WHERE name = 'Development Team' LIMIT 1), 
   'Hà Nội', 'retail_director', 'Retail'),
  ('admin@company.com', 'Admin User', '123456',
   (SELECT id FROM teams WHERE name = 'Development Team' LIMIT 1),
   'Hà Nội', 'retail_director', 'Admin')
) AS v(email, name, password, team_id, location, role, department_type)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'retail_director');

-- Disable RLS for now to avoid policy issues
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;
