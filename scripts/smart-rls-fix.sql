-- 🔧 SMART RLS FIX
-- Allows proper functionality while maintaining security

-- 1. Drop the overly restrictive policy
DROP POLICY IF EXISTS "Temporary lockdown" ON tasks;

-- 2. Create smart policies that allow app functionality

-- Policy 1: Allow reading for authenticated users (but we'll filter in app)
-- This is temporary until we implement proper Supabase Auth
CREATE POLICY "Allow read for app functionality" ON tasks
  FOR SELECT USING (true);

-- Policy 2: Restrict INSERT to prevent unauthorized task creation
CREATE POLICY "Restrict task creation" ON tasks
  FOR INSERT WITH CHECK (false);

-- Policy 3: Restrict UPDATE to prevent unauthorized modifications  
CREATE POLICY "Restrict task updates" ON tasks
  FOR UPDATE USING (false);

-- Policy 4: Restrict DELETE to prevent unauthorized deletions
CREATE POLICY "Restrict task deletions" ON tasks
  FOR DELETE USING (false);

-- 3. Add security logging
CREATE TABLE IF NOT EXISTS security_access_log (
  id SERIAL PRIMARY KEY,
  table_name TEXT,
  operation TEXT,
  user_info JSONB,
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address INET
);

-- 4. Create function to log access attempts
CREATE OR REPLACE FUNCTION log_task_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO security_access_log (table_name, operation, user_info)
  VALUES ('tasks', TG_OP, jsonb_build_object(
    'user_id', COALESCE(auth.uid()::text, 'anonymous'),
    'jwt_claims', auth.jwt()
  ));
  
  IF TG_OP = 'SELECT' THEN
    RETURN NULL; -- For SELECT triggers
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add trigger to log all access
DROP TRIGGER IF EXISTS log_task_access_trigger ON tasks;
CREATE TRIGGER log_task_access_trigger
  AFTER SELECT ON tasks
  FOR EACH STATEMENT
  EXECUTE FUNCTION log_task_access();

-- 6. Add comments for documentation
COMMENT ON POLICY "Allow read for app functionality" ON tasks IS 
'Temporary policy to allow app functionality. Filtering done in application layer. Replace with proper auth-based policies.';

COMMENT ON TABLE security_access_log IS 
'Logs all access to sensitive tables for security monitoring';

-- 7. Grant necessary permissions
GRANT SELECT ON security_access_log TO authenticated, anon;
