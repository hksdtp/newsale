#!/usr/bin/env node

// Simple test to verify IOSDatePicker component structure
const fs = require('fs');
const path = require('path');

function testIOSDatePickerStructure() {
  console.log('🧪 TESTING IOSDatePicker Component Structure');
  console.log('============================================\n');
  
  try {
    const filePath = path.join(__dirname, '../src/components/IOSDatePicker.tsx');
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Test 1: Check for required imports
    console.log('📦 1. IMPORT VALIDATION:');
    const requiredImports = [
      'Calendar',
      'ChevronLeft', 
      'ChevronRight',
      'X',
      'React',
      'useEffect',
      'useRef',
      'useState'
    ];
    
    let importsPassed = 0;
    requiredImports.forEach(imp => {
      if (content.includes(imp)) {
        console.log(`   ✅ ${imp}: Found`);
        importsPassed++;
      } else {
        console.log(`   ❌ ${imp}: Missing`);
      }
    });
    
    console.log(`   📊 Imports: ${importsPassed}/${requiredImports.length} passed\n`);
    
    // Test 2: Check for interface definition
    console.log('🔧 2. INTERFACE VALIDATION:');
    const hasInterface = content.includes('interface IOSDatePickerProps');
    const hasRequiredProps = [
      'value: string',
      'onChange: (date: string) => void',
      'isOpen: boolean',
      'onToggle: () => void',
      'onClose: () => void'
    ];
    
    console.log(`   ✅ Interface defined: ${hasInterface ? 'YES' : 'NO'}`);
    
    let propsPassed = 0;
    hasRequiredProps.forEach(prop => {
      if (content.includes(prop)) {
        console.log(`   ✅ ${prop}: Found`);
        propsPassed++;
      } else {
        console.log(`   ❌ ${prop}: Missing`);
      }
    });
    
    console.log(`   📊 Props: ${propsPassed}/${hasRequiredProps.length} passed\n`);
    
    // Test 3: Check for component structure
    console.log('🏗️ 3. COMPONENT STRUCTURE:');
    const structureChecks = [
      { name: 'Component declaration', pattern: 'const IOSDatePicker: React.FC<IOSDatePickerProps>' },
      { name: 'Color variants', pattern: 'const colorVariants' },
      { name: 'Helper functions', pattern: 'getTodayTextColor' },
      { name: 'Date formatting', pattern: 'formatDisplayDate' },
      { name: 'Month navigation', pattern: 'navigateMonth' },
      { name: 'Date selection', pattern: 'handleDateSelect' },
      { name: 'JSX return', pattern: 'return (' },
      { name: 'Export statement', pattern: 'export default IOSDatePicker' }
    ];
    
    let structurePassed = 0;
    structureChecks.forEach(check => {
      if (content.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: Found`);
        structurePassed++;
      } else {
        console.log(`   ❌ ${check.name}: Missing`);
      }
    });
    
    console.log(`   📊 Structure: ${structurePassed}/${structureChecks.length} passed\n`);
    
    // Test 4: Check for JSX syntax issues
    console.log('🔍 4. JSX SYNTAX VALIDATION:');
    const jsxChecks = [
      { name: 'Balanced JSX tags', test: () => {
        const openTags = (content.match(/<[^/][^>]*>/g) || []).length;
        const closeTags = (content.match(/<\/[^>]*>/g) || []).length;
        const selfClosing = (content.match(/<[^>]*\/>/g) || []).length;
        return openTags === closeTags + selfClosing;
      }},
      { name: 'No template literal issues', test: () => {
        return !content.includes('text-${') && !content.includes('border-${');
      }},
      { name: 'Proper className usage', test: () => {
        return content.includes('className={') && !content.includes('className="${');
      }},
      { name: 'Valid JSX expressions', test: () => {
        return !content.includes('${...') && !content.includes('}${');
      }}
    ];
    
    let jsxPassed = 0;
    jsxChecks.forEach(check => {
      const passed = check.test();
      console.log(`   ${passed ? '✅' : '❌'} ${check.name}: ${passed ? 'PASS' : 'FAIL'}`);
      if (passed) jsxPassed++;
    });
    
    console.log(`   📊 JSX Syntax: ${jsxPassed}/${jsxChecks.length} passed\n`);
    
    // Test 5: Check for TypeScript compliance
    console.log('📝 5. TYPESCRIPT COMPLIANCE:');
    const tsChecks = [
      { name: 'Type annotations', pattern: ': React.FC<' },
      { name: 'Interface usage', pattern: 'IOSDatePickerProps' },
      { name: 'State typing', pattern: 'useState<' },
      { name: 'Ref typing', pattern: 'useRef<' },
      { name: 'Function typing', pattern: ') => {' }
    ];
    
    let tsPassed = 0;
    tsChecks.forEach(check => {
      if (content.includes(check.pattern)) {
        console.log(`   ✅ ${check.name}: Found`);
        tsPassed++;
      } else {
        console.log(`   ❌ ${check.name}: Missing`);
      }
    });
    
    console.log(`   📊 TypeScript: ${tsPassed}/${tsChecks.length} passed\n`);
    
    // Summary
    console.log('📊 FINAL SUMMARY:');
    console.log('=================');
    const totalTests = requiredImports.length + hasRequiredProps.length + structureChecks.length + jsxChecks.length + tsChecks.length;
    const totalPassed = importsPassed + propsPassed + structurePassed + jsxPassed + tsPassed;
    
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed}`);
    console.log(`Failed: ${totalTests - totalPassed}`);
    console.log(`Success rate: ${Math.round((totalPassed / totalTests) * 100)}%`);
    
    if (totalPassed === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! IOSDatePicker component is healthy.');
    } else if (totalPassed / totalTests >= 0.9) {
      console.log('\n✅ MOSTLY HEALTHY! Minor issues detected but component should work.');
    } else {
      console.log('\n⚠️ ISSUES DETECTED! Component may have problems.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testIOSDatePickerStructure();
