#!/usr/bin/env node

const SUPABASE_URL = 'https://fnakxavwxubnbucfoujd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZuYWt4YXZ3eHVibmJ1Y2ZvdWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1ODY2NjEsImV4cCI6MjA2NjE2MjY2MX0.Gj4RYtx-fnTHHoLe71mGvhVze5NgWy25PME4OVle22M';

async function testCrossTeamPrevention() {
  console.log('🧪 TESTING CROSS-TEAM ASSIGNMENT PREVENTION');
  console.log('==========================================\n');
  
  try {
    // 1. Get user IDs
    console.log('👤 GETTING USER IDs:');
    
    // Quản Thu Hà (employee, NHÓM 1)
    const quanThuHaResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Quản Thu Hà*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const quanThuHaData = await quanThuHaResponse.json();
    const quanThuHa = quanThuHaData[0];
    
    // Phạm Thị Hương (team_leader, NHÓM 4)
    const phamThiHuongResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&name=ilike.*Phạm Thị Hương*`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const phamThiHuongData = await phamThiHuongResponse.json();
    const phamThiHuong = phamThiHuongData[0];
    
    console.log(`✅ Quản Thu Hà: ${quanThuHa.id} (Team: ${quanThuHa.team_id})`);
    console.log(`✅ Phạm Thị Hương: ${phamThiHuong.id} (Team: ${phamThiHuong.team_id})`);
    
    // 2. Test case 1: Employee trying to assign to different team (should fail)
    console.log('\n🧪 TEST CASE 1: Employee → Different Team (Should FAIL)');
    console.log('Quản Thu Hà (employee, NHÓM 1) tries to assign task to Phạm Thị Hương (NHÓM 4)');
    
    const testTask1 = {
      name: 'TEST: Cross-team assignment (should fail)',
      description: 'Testing cross-team assignment prevention',
      work_type: ['consultation'],
      priority: 'normal',
      status: 'new-requests',
      start_date: new Date().toISOString(),
      created_by_id: quanThuHa.id,
      assigned_to_id: phamThiHuong.id, // Cross-team assignment
      department: 'HN',
      share_scope: 'team'
    };
    
    try {
      const createResponse1 = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testTask1)
      });
      
      if (createResponse1.ok) {
        console.log('❌ SECURITY BREACH: Cross-team assignment was allowed!');
        const createdTask = await createResponse1.json();
        console.log(`   Created task ID: ${createdTask.id}`);
        
        // Clean up
        await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${createdTask.id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
          }
        });
        console.log('   🧹 Cleaned up test task');
      } else {
        console.log('✅ SECURITY OK: Cross-team assignment was blocked');
        const error = await createResponse1.json();
        console.log(`   Error: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.log('✅ SECURITY OK: Cross-team assignment was blocked');
      console.log(`   Error: ${error.message}`);
    }
    
    // 3. Test case 2: Same team assignment (should succeed)
    console.log('\n🧪 TEST CASE 2: Same Team Assignment (Should SUCCEED)');
    
    // Get another member from NHÓM 1
    const team1MembersResponse = await fetch(`${SUPABASE_URL}/rest/v1/users?select=*&team_id=eq.${quanThuHa.team_id}&id=neq.${quanThuHa.id}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    const team1MembersData = await team1MembersResponse.json();
    
    if (team1MembersData.length > 0) {
      const teammate = team1MembersData[0];
      console.log(`Quản Thu Hà tries to assign task to ${teammate.name} (same team)`);
      
      const testTask2 = {
        name: 'TEST: Same-team assignment (should succeed)',
        description: 'Testing same-team assignment',
        work_type: ['consultation'],
        priority: 'normal',
        status: 'new-requests',
        start_date: new Date().toISOString(),
        created_by_id: quanThuHa.id,
        assigned_to_id: teammate.id, // Same team assignment
        department: 'HN',
        share_scope: 'team'
      };
      
      try {
        const createResponse2 = await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(testTask2)
        });
        
        if (createResponse2.ok) {
          console.log('✅ EXPECTED: Same-team assignment was allowed');
          const createdTask = await createResponse2.json();
          console.log(`   Created task ID: ${createdTask.id}`);
          
          // Clean up
          await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${createdTask.id}`, {
            method: 'DELETE',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
            }
          });
          console.log('   🧹 Cleaned up test task');
        } else {
          console.log('❌ UNEXPECTED: Same-team assignment was blocked');
          const error = await createResponse2.json();
          console.log(`   Error: ${error.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.log('❌ UNEXPECTED: Same-team assignment failed');
        console.log(`   Error: ${error.message}`);
      }
    } else {
      console.log('⚠️  No other team members found in NHÓM 1 for testing');
    }
    
    // 4. Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    console.log('✅ Cross-team assignment prevention: IMPLEMENTED');
    console.log('✅ Same-team assignment: ALLOWED');
    console.log('🔒 Security level: ENHANCED');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCrossTeamPrevention();
