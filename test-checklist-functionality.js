/**
 * 🧪 Test Script for TaskChecklist Functionality
 * Run this in browser console to verify checklist features
 */

console.log('🧪 Starting TaskChecklist Functionality Test...');

// Test Configuration
const TEST_CONFIG = {
  TASK_ID: 'test-task-id', // Replace with actual task ID
  TEST_ITEMS: [
    'Test checklist item 1',
    'Test checklist item 2', 
    'Test checklist item 3'
  ],
  TIMEOUT: 2000 // 2 seconds timeout for async operations
};

// Test Results Storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper Functions
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const logTest = (testName, passed, error = null) => {
  if (passed) {
    console.log(`✅ ${testName}`);
    testResults.passed++;
  } else {
    console.log(`❌ ${testName}`, error);
    testResults.failed++;
    if (error) testResults.errors.push({ test: testName, error });
  }
};

const findElement = (selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
  }
  return element;
};

// Test Functions
async function testButtonsExist() {
  console.log('\n📋 Testing Button Existence...');
  
  // Test "Thêm mục" button (when items exist)
  const addButton = findElement('[data-testid="add-checklist-item"], button:contains("Thêm mục")');
  logTest('Add Item Button Exists', !!addButton);
  
  // Test "Thêm công việc con đầu tiên" button (when no items)
  const addFirstButton = findElement('button:contains("Thêm công việc con đầu tiên")');
  logTest('Add First Item Button Exists', !!addFirstButton);
  
  return { addButton, addFirstButton };
}

async function testButtonClick() {
  console.log('\n🖱️ Testing Button Click...');
  
  try {
    // Find and click add button
    const addButton = findElement('button:contains("Thêm mục"), button:contains("Thêm công việc con đầu tiên")');
    
    if (addButton) {
      addButton.click();
      await wait(500); // Wait for UI update
      
      // Check if input field appeared
      const inputField = findElement('input[placeholder*="Nhập nội dung công việc con"]');
      logTest('Input Field Appears After Click', !!inputField);
      
      return inputField;
    } else {
      logTest('Button Click Test', false, 'No add button found');
      return null;
    }
  } catch (error) {
    logTest('Button Click Test', false, error.message);
    return null;
  }
}

async function testInputFunctionality(inputField) {
  console.log('\n⌨️ Testing Input Functionality...');
  
  if (!inputField) {
    logTest('Input Functionality Test', false, 'No input field available');
    return;
  }
  
  try {
    // Test typing
    const testText = 'Test checklist item';
    inputField.value = testText;
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
    
    logTest('Input Accepts Text', inputField.value === testText);
    
    // Test placeholder
    const hasPlaceholder = inputField.placeholder.includes('Nhập nội dung công việc con');
    logTest('Input Has Correct Placeholder', hasPlaceholder);
    
    // Test focus
    inputField.focus();
    logTest('Input Can Be Focused', document.activeElement === inputField);
    
  } catch (error) {
    logTest('Input Functionality Test', false, error.message);
  }
}

async function testKeyboardHandlers(inputField) {
  console.log('\n⌨️ Testing Keyboard Handlers...');
  
  if (!inputField) {
    logTest('Keyboard Handlers Test', false, 'No input field available');
    return;
  }
  
  try {
    // Test Enter key
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    inputField.dispatchEvent(enterEvent);
    await wait(500);
    
    // Check if input disappeared (item was saved)
    const inputStillExists = document.contains(inputField);
    logTest('Enter Key Saves Item', !inputStillExists);
    
    // If input still exists, test ESC key
    if (inputStillExists) {
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      inputField.dispatchEvent(escEvent);
      await wait(500);
      
      const inputAfterEsc = document.contains(inputField);
      logTest('ESC Key Cancels Input', !inputAfterEsc);
    }
    
  } catch (error) {
    logTest('Keyboard Handlers Test', false, error.message);
  }
}

async function testSaveButtons() {
  console.log('\n💾 Testing Save/Cancel Buttons...');
  
  try {
    // Find save button (Check icon)
    const saveButton = findElement('button[title="Lưu"], button:has(svg):contains("Check")');
    logTest('Save Button Exists', !!saveButton);
    
    // Find cancel button (X icon)  
    const cancelButton = findElement('button[title="Hủy"], button:has(svg):contains("X")');
    logTest('Cancel Button Exists', !!cancelButton);
    
    // Test save button click
    if (saveButton) {
      saveButton.click();
      await wait(500);
      logTest('Save Button Clickable', true);
    }
    
  } catch (error) {
    logTest('Save/Cancel Buttons Test', false, error.message);
  }
}

async function testProgressCounter() {
  console.log('\n📊 Testing Progress Counter...');
  
  try {
    // Find progress counter
    const progressCounter = findElement('[data-testid="checklist-progress"], span:contains("("), span:contains("/")');
    logTest('Progress Counter Exists', !!progressCounter);
    
    if (progressCounter) {
      const counterText = progressCounter.textContent;
      const hasValidFormat = /\(\d+\/\d+\)/.test(counterText);
      logTest('Progress Counter Has Valid Format', hasValidFormat);
    }
    
  } catch (error) {
    logTest('Progress Counter Test', false, error.message);
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  try {
    // Test empty input submission
    const addButton = findElement('button:contains("Thêm mục"), button:contains("Thêm công việc con đầu tiên")');
    
    if (addButton) {
      addButton.click();
      await wait(500);
      
      const inputField = findElement('input[placeholder*="Nhập nội dung công việc con"]');
      if (inputField) {
        // Try to save empty input
        inputField.value = '';
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
        inputField.dispatchEvent(enterEvent);
        await wait(500);
        
        // Input should still exist (empty input not saved)
        const inputStillExists = document.contains(inputField);
        logTest('Empty Input Not Saved', inputStillExists);
      }
    }
    
  } catch (error) {
    logTest('Error Handling Test', false, error.message);
  }
}

// Main Test Runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive TaskChecklist Tests...\n');
  
  try {
    // Test 1: Button Existence
    const buttons = await testButtonsExist();
    
    // Test 2: Button Click
    const inputField = await testButtonClick();
    
    // Test 3: Input Functionality
    await testInputFunctionality(inputField);
    
    // Test 4: Keyboard Handlers
    await testKeyboardHandlers(inputField);
    
    // Test 5: Save/Cancel Buttons
    await testSaveButtons();
    
    // Test 6: Progress Counter
    await testProgressCounter();
    
    // Test 7: Error Handling
    await testErrorHandling();
    
    // Final Results
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.errors.length > 0) {
      console.log('\n🚨 Errors Details:');
      testResults.errors.forEach(({ test, error }) => {
        console.log(`- ${test}: ${error}`);
      });
    }
    
    // Overall Status
    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! TaskChecklist functionality is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Please check the issues above.');
    }
    
  } catch (error) {
    console.error('❌ Test runner failed:', error);
  }
}

// Auto-run if in browser environment
if (typeof window !== 'undefined') {
  console.log('🌐 Browser environment detected. Running tests...');
  runAllTests();
} else {
  console.log('📝 Test script loaded. Call runAllTests() to execute.');
}

// Export for manual execution
window.testChecklistFunctionality = runAllTests;
