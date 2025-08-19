#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function deepAnalysisCrossTeamTask() {
  console.log('🔍 DEEP ANALYSIS: Cross-Team Task "KH- Chị Linh - Quảng An"');
  console.log('================================================================\n');
  
  try {
    // 1. DETAILED DATABASE QUERY
    console.log('📊 1. DATABASE VERIFICATION:');
    console.log('============================');
    
    const taskResponse = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&name=ilike.*Quảng An*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const taskData = await taskResponse.json();
    if (!Array.isArray(taskData) || taskData.length === 0) {
      console.log('❌ Task not found in database');
      return;
    }
    
    const task = taskData[0];
    console.log(`✅ Task found: ${task.name}`);
    console.log(`   - ID: ${task.id}`);
    console.log(`   - Created by ID: ${task.created_by_id}`);
    console.log(`   - Assigned to ID: ${task.assigned_to_id}`);
    console.log(`   - Team ID: ${task.team_id}`);
    console.log(`   - Share scope: ${task.share_scope}`);
    console.log(`   - Department: ${task.department}`);
    console.log(`   - Status: ${task.status}`);
    console.log(`   - Created at: ${task.created_at}`);
    console.log(`   - Updated at: ${task.updated_at}`);
    
    // 2. USER VERIFICATION
    console.log('\n👥 2. USER VERIFICATION:');
    console.log('========================');
    
    // Get creator info
    const creatorResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=eq.${task.created_by_id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const creatorData = await creatorResponse.json();
    const creator = creatorData[0];
    
    // Get assignee info
    const assigneeResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&id=eq.${task.assigned_to_id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const assigneeData = await assigneeResponse.json();
    const assignee = assigneeData[0];
    
    console.log('👤 CREATOR (Quản Thu Hà):');
    console.log(`   - Name: ${creator.name}`);
    console.log(`   - ID: ${creator.id}`);
    console.log(`   - Team ID: ${creator.team_id}`);
    console.log(`   - Role: ${creator.role}`);
    console.log(`   - Location: ${creator.location}`);
    console.log(`   - Department: ${creator.department_type}`);
    
    console.log('\n👤 ASSIGNEE (Phạm Thị Hương):');
    console.log(`   - Name: ${assignee.name}`);
    console.log(`   - ID: ${assignee.id}`);
    console.log(`   - Team ID: ${assignee.team_id}`);
    console.log(`   - Role: ${assignee.role}`);
    console.log(`   - Location: ${assignee.location}`);
    console.log(`   - Department: ${assignee.department_type}`);
    
    // 3. TEAM VERIFICATION
    console.log('\n🏢 3. TEAM VERIFICATION:');
    console.log('========================');
    
    // Get creator's team
    const creatorTeamResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=eq.${creator.team_id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const creatorTeamData = await creatorTeamResponse.json();
    const creatorTeam = creatorTeamData[0];
    
    // Get assignee's team
    const assigneeTeamResponse = await fetch(`${SUPABASE_URL}/rest/v1/teams?select=*&id=eq.${assignee.team_id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const assigneeTeamData = await assigneeTeamResponse.json();
    const assigneeTeam = assigneeTeamData[0];
    
    console.log(`📍 Creator's team: ${creatorTeam.name} (ID: ${creatorTeam.id})`);
    console.log(`📍 Assignee's team: ${assigneeTeam.name} (ID: ${assigneeTeam.id})`);
    
    const isCrossTeam = creator.team_id !== assignee.team_id;
    console.log(`🔍 Cross-team assignment: ${isCrossTeam ? '❌ YES' : '✅ NO'}`);
    
    // 4. TIMELINE ANALYSIS
    console.log('\n⏰ 4. TIMELINE ANALYSIS:');
    console.log('========================');
    
    const taskCreatedAt = new Date(task.created_at);
    const fixDeployedAt = new Date('2025-08-19T10:00:00Z'); // Approximate fix time
    
    console.log(`📅 Task created: ${taskCreatedAt.toISOString()}`);
    console.log(`🔧 Fix deployed: ${fixDeployedAt.toISOString()}`);
    console.log(`🕐 Created before fix: ${taskCreatedAt < fixDeployedAt ? '✅ YES' : '❌ NO'}`);
    
    if (taskCreatedAt < fixDeployedAt) {
      console.log('💡 EXPLANATION: This is LEGACY DATA created before security fix');
    } else {
      console.log('🚨 SECURITY BREACH: Task created after fix - validation failed!');
    }
    
    // 5. PERMISSION ANALYSIS
    console.log('\n🔒 5. PERMISSION ANALYSIS:');
    console.log('==========================');
    
    console.log('Current permission rules:');
    console.log(`   - Creator role: ${creator.role}`);
    console.log(`   - Can assign cross-team: ${creator.role === 'retail_director' ? 'YES' : 'NO'}`);
    console.log(`   - Should be blocked: ${creator.role !== 'retail_director' && isCrossTeam ? 'YES' : 'NO'}`);
    
    // 6. VISIBILITY ANALYSIS
    console.log('\n👁️ 6. VISIBILITY ANALYSIS:');
    console.log('===========================');
    
    console.log('Why Phạm Thị Hương can see this task:');
    console.log(`   - Task assigned to her: ✅ YES`);
    console.log(`   - Share scope: ${task.share_scope}`);
    console.log(`   - Department: ${task.department}`);
    console.log(`   - Her location: ${assignee.location}`);
    
    // Check if task should be visible based on current filtering logic
    const shouldBeVisible = (
      task.assigned_to_id === assignee.id || // Assigned to her
      task.created_by_id === assignee.id ||  // Created by her
      (task.share_scope === 'public' && task.department === (assignee.location === 'Hà Nội' ? 'HN' : 'HCM'))
    );
    
    console.log(`   - Should be visible to Phạm Thị Hương: ${shouldBeVisible ? '✅ YES' : '❌ NO'}`);
    
    // 7. RECOMMENDATIONS
    console.log('\n💡 7. RECOMMENDATIONS:');
    console.log('=======================');
    
    if (taskCreatedAt < fixDeployedAt) {
      console.log('📋 LEGACY DATA HANDLING:');
      console.log('   1. ✅ Keep existing cross-team tasks (business continuity)');
      console.log('   2. 🔒 Prevent new cross-team assignments (security)');
      console.log('   3. 📊 Add audit trail for existing tasks');
      console.log('   4. 🏷️ Mark legacy tasks with special indicator');
      
      console.log('\n🔧 PROPOSED ACTIONS:');
      console.log('   1. Add "legacy_cross_team" flag to existing tasks');
      console.log('   2. Show warning in UI for legacy cross-team tasks');
      console.log('   3. Implement task transfer workflow for future changes');
      console.log('   4. Regular audit of cross-team assignments');
    } else {
      console.log('🚨 SECURITY BREACH ACTIONS:');
      console.log('   1. Investigate how this task bypassed validation');
      console.log('   2. Check if fix was properly deployed');
      console.log('   3. Review all tasks created after fix deployment');
      console.log('   4. Strengthen validation logic');
    }
    
    // 8. SUMMARY
    console.log('\n📊 8. EXECUTIVE SUMMARY:');
    console.log('========================');
    console.log(`Task: ${task.name}`);
    console.log(`Cross-team: ${isCrossTeam ? 'YES' : 'NO'}`);
    console.log(`Legacy data: ${taskCreatedAt < fixDeployedAt ? 'YES' : 'NO'}`);
    console.log(`Security risk: ${taskCreatedAt >= fixDeployedAt && isCrossTeam ? 'HIGH' : 'LOW'}`);
    console.log(`Action needed: ${taskCreatedAt < fixDeployedAt ? 'DATA MIGRATION' : 'SECURITY INVESTIGATION'}`);
    
  } catch (error) {
    console.error('❌ Analysis error:', error);
  }
}

deepAnalysisCrossTeamTask();
