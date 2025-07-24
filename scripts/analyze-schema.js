#!/usr/bin/env node

/**
 * Script to analyze existing database schema
 * Run with: node scripts/analyze-schema.js
 */

require('dotenv').config({ path: '.env.local' });

async function analyzeSchema() {
  console.log('🔍 Analyzing existing database schema...\n');

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables');
    process.exit(1);
  }

  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔗 Connected to Supabase successfully\n');

    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Could not fetch tables:', tablesError.message);
      return;
    }

    console.log('📋 Tables found:');
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });
    console.log('');

    // Analyze each table
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`🔍 Analyzing table: ${tableName}`);

      try {
        // Get column information
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .order('ordinal_position');

        if (columnsError) {
          console.log(`   ❌ Could not get columns: ${columnsError.message}`);
          continue;
        }

        console.log('   📊 Columns:');
        columns.forEach(col => {
          const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
          const defaultVal = col.column_default ? ` DEFAULT ${col.column_default}` : '';
          console.log(`      - ${col.column_name}: ${col.data_type} ${nullable}${defaultVal}`);
        });

        // Get sample data
        const { data: sampleData, error: dataError } = await supabase
          .from(tableName)
          .select('*')
          .limit(3);

        if (dataError) {
          console.log(`   ❌ Could not get sample data: ${dataError.message}`);
        } else {
          console.log(`   📝 Sample data (${sampleData?.length || 0} records):`);
          if (sampleData && sampleData.length > 0) {
            sampleData.forEach((row, index) => {
              console.log(`      ${index + 1}. ${JSON.stringify(row, null, 2).replace(/\n/g, '\n         ')}`);
            });
          }
        }

        console.log('');
      } catch (err) {
        console.log(`   ❌ Error analyzing table: ${err.message}\n`);
      }
    }

    // Check for foreign key relationships
    console.log('🔗 Checking foreign key relationships...\n');
    
    const { data: fkeys, error: fkError } = await supabase
      .from('information_schema.table_constraints')
      .select(`
        constraint_name,
        table_name,
        constraint_type
      `)
      .eq('table_schema', 'public')
      .eq('constraint_type', 'FOREIGN KEY');

    if (fkError) {
      console.log('❌ Could not check foreign keys:', fkError.message);
    } else {
      console.log('🔗 Foreign key constraints:');
      if (fkeys && fkeys.length > 0) {
        fkeys.forEach(fk => {
          console.log(`   - ${fk.table_name}: ${fk.constraint_name}`);
        });
      } else {
        console.log('   ℹ️  No foreign key constraints found');
      }
    }

  } catch (error) {
    console.error('❌ Schema analysis failed:', error.message);
  }
}

analyzeSchema();
