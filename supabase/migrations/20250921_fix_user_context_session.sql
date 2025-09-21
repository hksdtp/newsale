-- Fix set_user_context to use session-level settings instead of transaction-level
-- This ensures user context persists across multiple queries in the same session

-- Create policy for users table to allow anon access
CREATE POLICY IF NOT EXISTS users_select_policy ON public.users
  FOR SELECT
  USING (true);

-- Update set_user_context to use session-level settings
CREATE OR REPLACE FUNCTION set_user_context(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  -- Set a session-level custom setting that can be used in RLS policies
  -- false = session-level (persists until session ends)
  -- true = transaction-level (resets after transaction)
  PERFORM set_config('app.current_user_id', user_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure get_current_user_id function exists
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
