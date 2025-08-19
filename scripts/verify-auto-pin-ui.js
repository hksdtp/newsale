#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function verifyAutoPinUI() {
  console.log('🔍 VERIFYING AUTO-PIN UI IN CREATETASKMODAL');
  console.log('============================================\n');
  
  try {
    const filePath = path.join(__dirname, '../src/components/CreateTaskModal.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for auto-pin related code
    console.log('📋 1. CHECKING AUTO-PIN ELEMENTS:');
    console.log('=================================');
    
    const checks = [
      {
        name: 'Auto-pin state in formData',
        pattern: 'autoPinToCalendar: true',
        required: true
      },
      {
        name: 'Auto-pin UI section',
        pattern: 'Ghim vào Lịch Kế Hoạch',
        required: true
      },
      {
        name: 'Calendar icon import',
        pattern: 'Calendar',
        required: true
      },
      {
        name: 'Auto-pin checkbox',
        pattern: 'checked={formData.autoPinToCalendar}',
        required: true
      },
      {
        name: 'Auto-pin onChange handler',
        pattern: 'autoPinToCalendar: e.target.checked',
        required: true
      },
      {
        name: 'Auto-pin in onSubmit',
        pattern: 'autoPinToCalendar: formData.autoPinToCalendar',
        required: true
      },
      {
        name: 'Auto-pin description text',
        pattern: 'Tự động hiển thị công việc này trong Menu Kế Hoạch theo ngày tạo',
        required: true
      },
      {
        name: 'Auto-pin toggle styling',
        pattern: 'peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500',
        required: true
      }
    ];
    
    let passedChecks = 0;
    checks.forEach((check, index) => {
      const found = content.includes(check.pattern);
      const status = found ? '✅' : '❌';
      const importance = check.required ? '(REQUIRED)' : '(OPTIONAL)';
      
      console.log(`${index + 1}. ${check.name}: ${status} ${importance}`);
      
      if (found) {
        passedChecks++;
      } else if (check.required) {
        console.log(`   ⚠️  Missing: ${check.pattern}`);
      }
    });
    
    console.log(`\n📊 Results: ${passedChecks}/${checks.length} checks passed`);
    
    // Check for the complete auto-pin section
    console.log('\n🔍 2. CHECKING COMPLETE AUTO-PIN SECTION:');
    console.log('=========================================');
    
    const autoPinSectionStart = content.indexOf('Auto-pin to Calendar Option');
    const autoPinSectionEnd = content.indexOf('</div>', autoPinSectionStart + 500);
    
    if (autoPinSectionStart !== -1 && autoPinSectionEnd !== -1) {
      console.log('✅ Auto-pin section found in code');
      
      const sectionContent = content.substring(autoPinSectionStart, autoPinSectionEnd + 6);
      console.log('\n📝 Auto-pin section content:');
      console.log('----------------------------');
      console.log(sectionContent.substring(0, 300) + '...');
      
      // Check if section is properly structured
      const hasContainer = sectionContent.includes('bg-gray-800/30 rounded-lg p-4');
      const hasIcon = sectionContent.includes('Calendar');
      const hasToggle = sectionContent.includes('relative inline-flex');
      
      console.log('\n🏗️ Section structure:');
      console.log(`   - Container styling: ${hasContainer ? '✅' : '❌'}`);
      console.log(`   - Calendar icon: ${hasIcon ? '✅' : '❌'}`);
      console.log(`   - Toggle switch: ${hasToggle ? '✅' : '❌'}`);
      
    } else {
      console.log('❌ Auto-pin section not found in code');
    }
    
    // Check for any conditional rendering that might hide the section
    console.log('\n🔍 3. CHECKING FOR CONDITIONAL RENDERING:');
    console.log('=========================================');
    
    const conditionalPatterns = [
      'if (',
      '&& (',
      '? (',
      'display: none',
      'hidden',
      'visibility: hidden'
    ];
    
    let foundConditionals = [];
    conditionalPatterns.forEach(pattern => {
      const lines = content.split('\n');
      lines.forEach((line, lineNum) => {
        if (line.includes(pattern) && line.includes('autoPinToCalendar')) {
          foundConditionals.push({
            pattern,
            line: lineNum + 1,
            content: line.trim()
          });
        }
      });
    });
    
    if (foundConditionals.length === 0) {
      console.log('✅ No conditional rendering found that affects auto-pin section');
    } else {
      console.log('⚠️  Found conditional rendering:');
      foundConditionals.forEach(cond => {
        console.log(`   Line ${cond.line}: ${cond.content}`);
      });
    }
    
    // Check file size and last modified
    console.log('\n📊 4. FILE INFORMATION:');
    console.log('=======================');
    
    const stats = fs.statSync(filePath);
    console.log(`File size: ${stats.size} bytes`);
    console.log(`Last modified: ${stats.mtime.toISOString()}`);
    console.log(`Lines of code: ${content.split('\n').length}`);
    
    // Final assessment
    console.log('\n🎯 5. ASSESSMENT:');
    console.log('=================');
    
    if (passedChecks === checks.length) {
      console.log('✅ AUTO-PIN UI IS COMPLETE AND SHOULD BE VISIBLE');
      console.log('');
      console.log('If you don\'t see the auto-pin section on Vercel:');
      console.log('1. 🔄 Hard refresh browser (Ctrl+Shift+R)');
      console.log('2. 🧹 Clear browser cache');
      console.log('3. ⏳ Wait for Vercel deployment to complete');
      console.log('4. 🔍 Check browser developer tools for errors');
      console.log('5. 📱 Try different browser/incognito mode');
    } else {
      console.log('❌ AUTO-PIN UI IS INCOMPLETE');
      console.log(`Missing ${checks.length - passedChecks} required elements`);
    }
    
    // Generate test instructions
    console.log('\n📋 6. TESTING INSTRUCTIONS:');
    console.log('===========================');
    console.log('To test auto-pin feature on Vercel:');
    console.log('1. Go to your Vercel app URL');
    console.log('2. Login to the application');
    console.log('3. Navigate to task creation (usually a "+" button)');
    console.log('4. Look for "Ghim vào Lịch Kế Hoạch" section');
    console.log('5. It should have:');
    console.log('   - Calendar icon (green/blue gradient)');
    console.log('   - "Ghim vào Lịch Kế Hoạch" label');
    console.log('   - Description text about Menu Kế Hoạch');
    console.log('   - Toggle switch (should be ON by default)');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyAutoPinUI();
