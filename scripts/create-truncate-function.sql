-- Create a function to truncate users table (bypasses RLS)
CREATE OR REPLACE FUNCTION truncate_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Disable RLS temporarily
  SET row_security = off;
  
  -- Delete all users
  DELETE FROM users;
  
  -- Re-enable RLS
  SET row_security = on;
END;
$$;

-- Grant execute permission to anon role
GRANT EXECUTE ON FUNCTION truncate_users_table() TO anon;
GRANT EXECUTE ON FUNCTION truncate_users_table() TO authenticated;
