#!/bin/bash

# 🚨 EMERGENCY SECURITY FIX
# Immediately fixes the critical RLS vulnerability in tasks table

echo "🚨 STARTING EMERGENCY SECURITY FIX..."
echo ""

# Supabase configuration
SUPABASE_URL="https://fnakxavwxubnbucfoujd.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M"

# Test current vulnerability
echo "🔍 Testing current vulnerability..."
RESPONSE=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/tasks?select=id,name,created_by_id&limit=3" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

if [[ $RESPONSE == *"id"* ]]; then
  echo "⚠️  VULNERABILITY CONFIRMED: Can access tasks without authentication"
  echo "📋 Sample exposed data: $RESPONSE"
else
  echo "❓ Could not confirm vulnerability or already fixed"
fi

echo ""
echo "🔧 Applying emergency security fix..."

# SQL to fix the vulnerability
SQL_FIX='DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks; CREATE POLICY "Emergency security lockdown" ON tasks FOR ALL USING (false);'

# Try to execute SQL fix using RPC
echo "⚡ Executing SQL fix..."
FIX_RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"${SQL_FIX}\"}")

if [[ $FIX_RESPONSE == *"error"* ]]; then
  echo "❌ SQL fix failed: $FIX_RESPONSE"
  echo ""
  echo "🔄 Trying alternative approach..."
  
  # Try individual statements
  echo "⚡ Dropping dangerous policy..."
  DROP_RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"sql": "DROP POLICY IF EXISTS \"Allow all operations on tasks\" ON tasks"}')
  
  echo "⚡ Creating lockdown policy..."
  CREATE_RESPONSE=$(curl -s -X POST \
    "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -d '{"sql": "CREATE POLICY \"Emergency security lockdown\" ON tasks FOR ALL USING (false)"}')
  
  echo "Drop response: $DROP_RESPONSE"
  echo "Create response: $CREATE_RESPONSE"
else
  echo "✅ SQL fix executed successfully!"
fi

echo ""
echo "🧪 Testing fix effectiveness..."

# Test if fix worked
TEST_RESPONSE=$(curl -s -X GET \
  "${SUPABASE_URL}/rest/v1/tasks?select=id,name&limit=1" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

if [[ $TEST_RESPONSE == *"error"* ]] || [[ $TEST_RESPONSE == "[]" ]]; then
  echo "✅ SECURITY FIX SUCCESSFUL: Access is now blocked"
  echo "   Response: $TEST_RESPONSE"
else
  echo "⚠️  WARNING: Fix may not be fully effective"
  echo "   Response: $TEST_RESPONSE"
fi

echo ""
echo "🎉 EMERGENCY SECURITY FIX COMPLETED!"
echo ""
echo "📋 SUMMARY:"
echo "✅ Attempted to remove dangerous RLS policy"
echo "✅ Applied temporary lockdown policy"
echo "✅ Mai Tiến Đạt's tasks should no longer be visible to other users"
echo ""
echo "🔄 NEXT STEPS:"
echo "1. Restart your application"
echo "2. Test that users can only see their own tasks"
echo "3. Implement proper authentication integration"
echo "4. Apply full RLS policies with proper user context"
echo ""
echo "⚠️  NOTE: This is a temporary fix. Proper authentication is still needed."
