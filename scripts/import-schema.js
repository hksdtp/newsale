#!/usr/bin/env node

/**
 * Script to help import database schema to Supabase
 * Run with: node scripts/import-schema.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function openSqlEditor() {
  console.log('🚀 Supabase Schema Import Helper\n');

  // Read SQL schema file
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found:', schemaPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf8');
  const lineCount = sqlContent.split('\n').length;

  console.log('📋 Schema file ready for import:');
  console.log(`📄 File: database/schema.sql`);
  console.log(`📊 Lines: ${lineCount}`);
  console.log(`💾 Size: ${Math.round(sqlContent.length / 1024)}KB\n`);

  console.log('🔗 Opening Supabase SQL Editor...');
  console.log('📍 URL: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql\n');

  // Try to open browser
  try {
    const url = 'https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql';

    // Detect OS and open browser
    const platform = process.platform;
    let command;

    if (platform === 'darwin') {
      command = `open "${url}"`;
    } else if (platform === 'win32') {
      command = `start "${url}"`;
    } else {
      command = `xdg-open "${url}"`;
    }

    execSync(command);
    console.log('✅ Browser opened successfully!\n');
  } catch (error) {
    console.log('⚠️  Could not open browser automatically');
    console.log('🔗 Please manually open: https://supabase.com/dashboard/project/fnakxavwxubnbucfoujd/sql\n');
  }

  console.log('📋 Next steps:');
  console.log('1. ✅ Browser should open to Supabase SQL Editor');
  console.log('2. 📄 Copy the entire content from database/schema.sql');
  console.log('3. 📝 Paste into the SQL Editor');
  console.log('4. ▶️  Click "Run" to execute the schema');
  console.log('5. ✅ Verify tables are created (teams, locations, members)');
  console.log('6. 🔄 Refresh your app at http://localhost:3000\n');

  console.log('🧪 Test data included:');
  console.log('- 👥 10 team members with password "123456"');
  console.log('- 🏢 3 locations: Hà Nội, TP.HCM, Remote');
  console.log('- 👑 1 admin: admin@company.com\n');

  console.log('🔧 Troubleshooting:');
  console.log('- If SQL fails: Check for existing tables and drop them first');
  console.log('- If connection fails: Verify .env.local configuration');
  console.log('- If login fails: Ensure schema was imported successfully\n');

  console.log('📚 See QUICK_START.md for detailed instructions');
}

openSqlEditor();
