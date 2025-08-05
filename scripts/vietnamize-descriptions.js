#!/usr/bin/env node

/**
 * 🇻🇳 VIETNAMIZE DESCRIPTIONS
 * Update "From:" to "Từ:" in existing tasks
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🇻🇳 Vietnamizing Task Descriptions');
console.log('==================================');

const supabase = createClient(supabaseUrl, anonKey);

async function vietnamizeDescriptions() {
  try {
    // Find all tasks with "From:" in description
    console.log('🔍 Finding tasks with "From:" descriptions...');
    
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('source', 'checklist_item')
      .like('description', 'From:%');

    if (error) {
      console.log('❌ Error finding tasks:', error.message);
      return;
    }

    console.log(`📋 Found ${tasks?.length || 0} tasks to vietnamize`);

    if (!tasks || tasks.length === 0) {
      console.log('✅ No tasks need vietnamizing');
      return;
    }

    // Process each task
    for (const task of tasks) {
      console.log(`\n🇻🇳 Vietnamizing task: ${task.name}`);
      console.log(`   Current: ${task.description}`);

      // Replace "From:" with "Từ:"
      const newDescription = task.description.replace(/^From:/, 'Từ:');
      console.log(`   New: ${newDescription}`);

      // Update task
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ description: newDescription })
        .eq('id', task.id);

      if (updateError) {
        console.log(`   ❌ Update failed: ${updateError.message}`);
      } else {
        console.log(`   ✅ Vietnamized successfully`);
      }
    }

    console.log('\n🎉 Vietnamization completed!');
    console.log('📋 Summary:');
    console.log(`   - Found: ${tasks.length} tasks`);
    console.log(`   - Updated: "From:" → "Từ:"`);
    console.log('');
    console.log('🔄 Refresh your Planning menu to see Vietnamese descriptions');

  } catch (error) {
    console.log('❌ Vietnamization failed:', error.message);
  }
}

async function main() {
  await vietnamizeDescriptions();
  
  console.log('\n🧪 Expected Result:');
  console.log('==================');
  console.log('✅ Gặp khách hàng');
  console.log('✅ Từ: Test Task After Fix');
}

main().catch(console.error);
