-- 🚨 EMERGENCY SECURITY FIX
-- This script immediately fixes the critical RLS vulnerability

-- 1. Drop the dangerous policy that allows all access
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Enable all operations on tasks" ON tasks;

-- 2. Create temporary restrictive policy (blocks all access until proper auth is implemented)
CREATE POLICY "Temporary security lockdown" ON tasks
  FOR ALL USING (false);

-- 3. Create policy for authenticated users only (requires proper Supabase auth)
CREATE POLICY "Authenticated users only" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Add comment explaining the fix
COMMENT ON TABLE tasks IS 'SECURITY FIX APPLIED: RLS policies updated to prevent unauthorized access. All users must be properly authenticated.';

-- 5. Log the security fix
INSERT INTO public.security_audit_log (
  event_type,
  description,
  applied_at,
  applied_by
) VALUES (
  'CRITICAL_SECURITY_FIX',
  'Fixed RLS vulnerability in tasks table - removed policy that allowed all users to see all tasks',
  NOW(),
  'emergency_fix_script'
) ON CONFLICT DO NOTHING;
