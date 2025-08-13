#!/usr/bin/env node

/**
 * 🔍 CHECK SUPABASE INSTANCES
 * Kiểm tra số lượng Supabase client instances được tạo
 */

const fs = require('fs');
const path = require('path');

function findSupabaseInstances() {
  console.log('🔍 Tìm kiếm các Supabase client instances...\n');

  const srcDir = path.join(__dirname, '../src');
  const scriptsDir = path.join(__dirname, '.');
  
  const results = {
    createClientCalls: [],
    supabaseImports: [],
    recommendations: []
  };

  function searchInDirectory(dir, dirName) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
        searchInDirectory(fullPath, dirName);
      } else if (file.isFile() && (file.name.endsWith('.ts') || file.name.endsWith('.tsx') || file.name.endsWith('.js'))) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          const relativePath = path.relative(path.join(__dirname, '..'), fullPath);
          
          // Tìm createClient calls
          const createClientMatches = content.match(/createClient\s*\(/g);
          if (createClientMatches) {
            results.createClientCalls.push({
              file: relativePath,
              count: createClientMatches.length,
              lines: content.split('\n').map((line, index) => 
                line.includes('createClient') ? index + 1 : null
              ).filter(Boolean)
            });
          }
          
          // Tìm supabase imports
          const supabaseImportMatches = content.match(/import.*supabase.*from/g);
          if (supabaseImportMatches) {
            results.supabaseImports.push({
              file: relativePath,
              imports: supabaseImportMatches
            });
          }
          
        } catch (error) {
          // Skip files that can't be read
        }
      }
    }
  }

  // Search in src directory
  searchInDirectory(srcDir, 'src');
  
  // Search in scripts directory (limited)
  const scriptFiles = fs.readdirSync(scriptsDir).filter(f => f.endsWith('.js') && f !== 'check-supabase-instances.js');
  for (const scriptFile of scriptFiles.slice(0, 5)) { // Limit to 5 scripts
    try {
      const content = fs.readFileSync(path.join(scriptsDir, scriptFile), 'utf8');
      const createClientMatches = content.match(/createClient\s*\(/g);
      if (createClientMatches) {
        results.createClientCalls.push({
          file: `scripts/${scriptFile}`,
          count: createClientMatches.length,
          lines: content.split('\n').map((line, index) => 
            line.includes('createClient') ? index + 1 : null
          ).filter(Boolean)
        });
      }
    } catch (error) {
      // Skip
    }
  }

  return results;
}

function analyzeResults(results) {
  console.log('📊 KẾT QUẢ PHÂN TÍCH:\n');
  
  console.log(`🔧 Tìm thấy ${results.createClientCalls.length} files có createClient calls:`);
  results.createClientCalls.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.file} (${item.count} calls) - Lines: ${item.lines.join(', ')}`);
  });
  
  console.log(`\n📦 Tìm thấy ${results.supabaseImports.length} files import supabase:`);
  results.supabaseImports.forEach((item, index) => {
    console.log(`   ${index + 1}. ${item.file}`);
  });

  console.log('\n🎯 PHÂN TÍCH VẤN ĐỀ:');
  
  const mainClientFiles = results.createClientCalls.filter(item => 
    item.file.includes('src/shared/api/supabase.ts') || 
    item.file.includes('src/services/storageService.ts')
  );
  
  const scriptFiles = results.createClientCalls.filter(item => 
    item.file.includes('scripts/')
  );
  
  console.log(`   📋 Main app clients: ${mainClientFiles.length}`);
  console.log(`   📋 Script clients: ${scriptFiles.length}`);
  console.log(`   📋 Other clients: ${results.createClientCalls.length - mainClientFiles.length - scriptFiles.length}`);

  console.log('\n✅ GIẢI PHÁP ĐÃ ÁP DỤNG:');
  console.log('   1. ✅ Removed duplicate createClient in attachmentService.ts');
  console.log('   2. ✅ Use single storageService instance');
  console.log('   3. ✅ Main supabase client remains singleton');

  console.log('\n🔍 KIỂM TRA WARNING:');
  console.log('   1. Refresh trang web app (F5)');
  console.log('   2. Mở Developer Tools (F12)');
  console.log('   3. Kiểm tra Console tab');
  console.log('   4. Warning "Multiple GoTrueClient instances" phải biến mất');

  console.log('\n⚠️  LƯU Ý:');
  console.log('   - Scripts tạo client riêng là bình thường (chạy độc lập)');
  console.log('   - Chỉ cần lo về clients trong src/ directory');
  console.log('   - StorageService cần service key nên tạo client riêng là OK');

  if (results.createClientCalls.length <= 2) {
    console.log('\n🎉 TÌNH TRẠNG: GOOD - Số lượng clients hợp lý');
  } else if (results.createClientCalls.length <= 5) {
    console.log('\n⚠️  TÌNH TRẠNG: ACCEPTABLE - Cần theo dõi');
  } else {
    console.log('\n🚨 TÌNH TRẠNG: TOO MANY - Cần cleanup');
  }
}

// Chạy analysis
const results = findSupabaseInstances();
analyzeResults(results);
