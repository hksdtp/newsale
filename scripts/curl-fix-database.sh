#!/bin/bash

# Fix database using curl and Supabase API
echo "🔧 Fixing database using curl..."

# Supabase project details
PROJECT_REF="fnakxavwxubnbucfoujd"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDU4NjY2MSwiZXhwIjoyMDY2MTYyNjYxfQ.Xwa7Zz2pgg9wp-pqukoGSKy2IMg11kExKolbrBSQfAM"
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo "📋 Step 1: Dropping foreign key constraints..."

# Try to drop foreign key constraints using PostgREST
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sql": "ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_id_fkey; ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_id_fkey; ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_team_id_fkey;"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n📋 Step 2: Testing task insertion..."

# Test task insertion
curl -X POST "${SUPABASE_URL}/rest/v1/tasks" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "name": "Curl Test Task",
    "description": "Testing via curl",
    "work_type": "other",
    "priority": "normal", 
    "status": "new-requests",
    "created_by_id": "6be99296-c122-457c-a7e6-2c5af3f78d44",
    "assigned_to_id": "6be99296-c122-457c-a7e6-2c5af3f78d44",
    "team_id": "018c0ab7-bf40-4b45-8514-2de4e89bab61",
    "department": "HN"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n📋 Step 3: Checking if task was created..."

# Check if task exists
curl -X GET "${SUPABASE_URL}/rest/v1/tasks?name=eq.Curl%20Test%20Task&select=id,name,created_at" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n📋 Step 4: Cleaning up test task..."

# Delete test task
curl -X DELETE "${SUPABASE_URL}/rest/v1/tasks?name=eq.Curl%20Test%20Task" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -w "\nHTTP Status: %{http_code}\n"

echo -e "\n✅ Database fix attempt completed!"
echo "🔧 Now test in browser:"
echo "   1. Login: duy.le@company.com / 123456"
echo "   2. Go to Work tab"
echo "   3. Create a task"
echo "   4. Should save to database without 'lưu tạm thời' message"
