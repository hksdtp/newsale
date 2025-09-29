// Debug Work Page Specifically
// Kiểm tra và fix lỗi trang công việc

const { chromium } = require('playwright');
const fs = require('fs');

async function debugWorkPage() {
  console.log('🔍 Starting Work Page Debug...');
  
  let browser, page;
  
  try {
    // Khởi động browser
    browser = await chromium.launch({ 
      headless: false,
      devtools: true
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Đọc debug script
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
    const modifiedDebugScript = debugScript.replace('runCompleteDebug();', '// Auto-run disabled');
    
    // Navigate đến trang chính trước
    console.log('📍 Navigating to main app...');
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
    
    // Login process
    console.log('🔐 Logging in...');
    await page.click('button:has-text("Hà Nội")');
    await page.waitForTimeout(2000);
    
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Tiếp tục")');
    await page.waitForTimeout(3000);
    
    // Navigate đến trang work
    console.log('📍 Navigating to work page...');
    await page.goto('http://localhost:3002/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ Work page loaded');
    
    // Inject debug script
    await page.evaluate(modifiedDebugScript);
    
    // Capture console errors
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Capture network errors
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok()) {
        networkErrors.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        });
      }
    });
    
    // Chạy debug chi tiết
    console.log('🔍 Running detailed work page analysis...');
    
    // 1. Check accessibility issues
    const accessibilityIssues = await page.evaluate(() => {
      if (window.debugConsole) {
        const issues = window.debugConsole.checkAccessibility();
        return issues.map(issue => ({
          element: issue.element,
          problems: issue.problems,
          selector: issue.selector
        }));
      }
      return [];
    });
    
    // 2. Check for specific work page elements
    const workPageElements = await page.evaluate(() => {
      const elements = {
        taskCards: document.querySelectorAll('[data-testid*="task"], .task-card, .task-item').length,
        createButton: document.querySelector('button:has-text("Tạo"), button:has-text("Create"), button[aria-label*="tạo"]') ? true : false,
        filterButtons: document.querySelectorAll('button[role="tab"], .filter-button, .tab-button').length,
        taskList: document.querySelector('.task-list, .tasks-container, [data-testid="task-list"]') ? true : false,
        loadingSpinner: document.querySelector('.loading, .spinner, [data-testid="loading"]') ? true : false,
        errorMessage: document.querySelector('.error, .error-message, [data-testid="error"]') ? true : false
      };
      
      // Check for React errors in console
      const reactErrors = [];
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        // React is loaded
      }
      
      return elements;
    });
    
    // 3. Check TaskService functionality
    const taskServiceStatus = await page.evaluate(() => {
      const status = {
        taskServiceAvailable: !!window.taskService,
        supabaseAvailable: !!window.supabase,
        tasksInLocalStorage: localStorage.getItem('tasks') ? true : false,
        debugResultsAvailable: localStorage.getItem('completeDebugResults') ? true : false
      };
      
      // Try to access TaskService methods if available
      if (window.taskService) {
        try {
          status.taskServiceMethods = Object.getOwnPropertyNames(window.taskService);
        } catch (error) {
          status.taskServiceError = error.message;
        }
      }
      
      return status;
    });
    
    // 4. Check for JavaScript errors
    const jsErrors = await page.evaluate(() => {
      const errors = [];
      const originalError = console.error;
      
      // Capture any immediate errors
      try {
        // Test basic functionality
        if (typeof React !== 'undefined') {
          errors.push('React is available');
        } else {
          errors.push('React is not available');
        }
        
        if (typeof window.taskService !== 'undefined') {
          errors.push('TaskService is available');
        } else {
          errors.push('TaskService is not available');
        }
      } catch (error) {
        errors.push(`JS Error: ${error.message}`);
      }
      
      return errors;
    });
    
    // 5. Performance check
    const performance = await page.evaluate(() => {
      if (window.debugConsole) {
        return window.debugConsole.checkPerformance();
      }
      return {};
    });
    
    // Wait for any async operations
    await page.waitForTimeout(3000);
    
    // Collect final results
    const workPageReport = {
      timestamp: new Date().toISOString(),
      url: await page.url(),
      title: await page.title(),
      accessibilityIssues: accessibilityIssues,
      workPageElements: workPageElements,
      taskServiceStatus: taskServiceStatus,
      jsErrors: jsErrors,
      performance: performance,
      consoleMessages: consoleMessages.slice(-10),
      networkErrors: networkErrors
    };
    
    // Save report
    fs.writeFileSync('./work-page-debug-report.json', JSON.stringify(workPageReport, null, 2));
    
    // Display analysis
    displayWorkPageAnalysis(workPageReport);
    
    // Take screenshot
    await page.screenshot({ 
      path: './work-page-screenshot.png', 
      fullPage: true 
    });
    
    // Generate fixes
    generateWorkPageFixes(workPageReport);
    
  } catch (error) {
    console.error('❌ Error during work page debug:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function displayWorkPageAnalysis(report) {
  console.log('\n🎯 ===== PHÂN TÍCH TRANG CÔNG VIỆC =====');
  console.log(`📅 Thời gian: ${report.timestamp}`);
  console.log(`🌐 URL: ${report.url}`);
  console.log(`📄 Title: ${report.title}`);
  
  console.log('\n🔍 === ACCESSIBILITY ISSUES ===');
  if (report.accessibilityIssues && report.accessibilityIssues.length > 0) {
    console.log(`❌ Tìm thấy ${report.accessibilityIssues.length} vấn đề accessibility:`);
    report.accessibilityIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.element}:`);
      issue.problems.forEach(problem => {
        console.log(`   • ${problem}`);
      });
    });
  } else {
    console.log('✅ Không tìm thấy vấn đề accessibility');
  }
  
  console.log('\n📋 === WORK PAGE ELEMENTS ===');
  const elements = report.workPageElements;
  console.log(`📝 Task Cards: ${elements.taskCards}`);
  console.log(`➕ Create Button: ${elements.createButton ? '✅' : '❌'}`);
  console.log(`🔽 Filter Buttons: ${elements.filterButtons}`);
  console.log(`📋 Task List: ${elements.taskList ? '✅' : '❌'}`);
  console.log(`⏳ Loading Spinner: ${elements.loadingSpinner ? '⚠️ Still loading' : '✅ Loaded'}`);
  console.log(`❌ Error Message: ${elements.errorMessage ? '⚠️ Has errors' : '✅ No errors'}`);
  
  console.log('\n🔧 === TASKSERVICE STATUS ===');
  const taskService = report.taskServiceStatus;
  console.log(`TaskService: ${taskService.taskServiceAvailable ? '✅' : '❌'}`);
  console.log(`Supabase: ${taskService.supabaseAvailable ? '✅' : '❌'}`);
  console.log(`Tasks in LocalStorage: ${taskService.tasksInLocalStorage ? '✅' : '❌'}`);
  
  console.log('\n⚡ === PERFORMANCE ===');
  if (report.performance.loadTime) {
    console.log(`Load Time: ${report.performance.loadTime}ms`);
    console.log(`Memory: ${report.performance.memory?.used || 'N/A'}MB`);
  }
  
  console.log('\n🚨 === ERRORS & WARNINGS ===');
  if (report.networkErrors.length > 0) {
    console.log('Network Errors:');
    report.networkErrors.forEach(error => {
      console.log(`   • ${error.status} ${error.url}`);
    });
  }
  
  if (report.consoleMessages.length > 0) {
    console.log('Recent Console Messages:');
    report.consoleMessages.forEach(msg => {
      const icon = msg.type === 'error' ? '❌' : msg.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`   ${icon} ${msg.text}`);
    });
  }
}

function generateWorkPageFixes(report) {
  console.log('\n🔧 ===== GIẢI PHÁP SỬA LỖI =====');
  
  const fixes = [];
  
  // Accessibility fixes
  if (report.accessibilityIssues.length > 0) {
    fixes.push({
      priority: 'HIGH',
      category: 'Accessibility',
      issue: `${report.accessibilityIssues.length} accessibility issues`,
      solution: 'Add id, name, and aria-label attributes to form elements',
      files: ['src/pages/WorkPage.tsx', 'src/components/TaskCard.tsx', 'src/components/CreateTaskModal.tsx']
    });
  }
  
  // TaskService fixes
  if (!report.taskServiceStatus.taskServiceAvailable) {
    fixes.push({
      priority: 'HIGH',
      category: 'Functionality',
      issue: 'TaskService not available in browser',
      solution: 'Expose TaskService to window object for debugging',
      files: ['src/main.tsx', 'src/services/taskService.ts']
    });
  }
  
  // UI Element fixes
  if (!report.workPageElements.createButton) {
    fixes.push({
      priority: 'MEDIUM',
      category: 'UI',
      issue: 'Create button not found',
      solution: 'Ensure create task button is properly rendered',
      files: ['src/pages/WorkPage.tsx']
    });
  }
  
  if (!report.workPageElements.taskList) {
    fixes.push({
      priority: 'HIGH',
      category: 'UI',
      issue: 'Task list container not found',
      solution: 'Check task list rendering and data loading',
      files: ['src/pages/WorkPage.tsx', 'src/components/TaskList.tsx']
    });
  }
  
  // Save fixes
  fs.writeFileSync('./work-page-fixes.json', JSON.stringify(fixes, null, 2));
  
  // Display fixes
  fixes.forEach((fix, index) => {
    const priorityIcon = fix.priority === 'HIGH' ? '🔴' : fix.priority === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`${priorityIcon} ${index + 1}. [${fix.priority}] ${fix.issue}`);
    console.log(`   💡 Solution: ${fix.solution}`);
    console.log(`   📁 Files: ${fix.files.join(', ')}`);
  });
  
  console.log('\n📄 Detailed fixes saved to work-page-fixes.json');
  console.log('📸 Screenshot saved to work-page-screenshot.png');
}

// Run work page debug
debugWorkPage().catch(console.error);
