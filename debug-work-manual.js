// Manual Debug Work Page
// Debug trang work với timeout dài hơn và error handling

const { chromium } = require('playwright');
const fs = require('fs');

async function debugWorkPageManual() {
  console.log('🔍 Starting Manual Work Page Debug...');
  
  let browser, page;
  
  try {
    // Khởi động browser
    browser = await chromium.launch({ 
      headless: false,
      devtools: true,
      slowMo: 1000 // Slow down for debugging
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // Capture all console messages
    const allConsoleMessages = [];
    page.on('console', msg => {
      const message = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      allConsoleMessages.push(message);
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    
    // Capture network errors
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok()) {
        const error = {
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        };
        networkErrors.push(error);
        console.log(`[NETWORK ERROR] ${response.status()} ${response.url()}`);
      }
    });
    
    // Navigate đến trang chính
    console.log('📍 Step 1: Navigating to main app...');
    await page.goto('http://localhost:3002', { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    console.log('✅ Main page loaded');
    await page.waitForTimeout(2000);
    
    // Login process
    console.log('🔐 Step 2: Logging in...');
    try {
      await page.click('button:has-text("Hà Nội")', { timeout: 10000 });
      await page.waitForTimeout(3000);
      
      await page.fill('input[type="password"]', '123456');
      await page.click('button:has-text("Tiếp tục")');
      await page.waitForTimeout(5000);
      
      console.log('✅ Login completed');
    } catch (error) {
      console.log('⚠️ Login process error:', error.message);
    }
    
    // Check current URL
    const currentUrl = await page.url();
    console.log(`📍 Current URL: ${currentUrl}`);
    
    // Try to navigate to work page step by step
    console.log('📍 Step 3: Attempting to navigate to work page...');
    
    try {
      // First try clicking navigation if available
      const workNavButton = await page.$('a[href*="work"], button:has-text("Công việc"), a:has-text("Work")');
      if (workNavButton) {
        console.log('🔗 Found work navigation button, clicking...');
        await workNavButton.click();
        await page.waitForTimeout(3000);
      } else {
        console.log('🔗 No work nav button found, trying direct navigation...');
        await page.goto('http://localhost:3002/dashboard/work', { 
          waitUntil: 'domcontentloaded',
          timeout: 60000 
        });
      }
    } catch (error) {
      console.log('❌ Navigation to work page failed:', error.message);
      console.log('🔄 Trying alternative approach...');
      
      // Try going to dashboard first
      await page.goto('http://localhost:3002/dashboard', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
      await page.waitForTimeout(2000);
      
      // Then try work page
      await page.goto('http://localhost:3002/dashboard/work', { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
    }
    
    const finalUrl = await page.url();
    console.log(`📍 Final URL: ${finalUrl}`);
    
    // Wait for page to stabilize
    await page.waitForTimeout(5000);
    
    // Check if we're on the work page
    const isWorkPage = finalUrl.includes('/work') || finalUrl.includes('/dashboard');
    console.log(`📋 Is work page: ${isWorkPage}`);
    
    // Inject debug script regardless
    console.log('💉 Injecting debug script...');
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
    const modifiedDebugScript = debugScript.replace('runCompleteDebug();', '// Auto-run disabled');
    
    try {
      await page.evaluate(modifiedDebugScript);
      console.log('✅ Debug script injected');
    } catch (error) {
      console.log('❌ Debug script injection failed:', error.message);
    }
    
    // Analyze current page
    console.log('🔍 Analyzing current page...');
    
    const pageAnalysis = await page.evaluate(() => {
      const analysis = {
        url: window.location.href,
        title: document.title,
        hasReact: !!window.React,
        hasTaskService: !!window.taskService,
        hasSupabase: !!window.supabase,
        bodyContent: document.body.innerText.substring(0, 500),
        elementCounts: {
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          forms: document.querySelectorAll('form').length,
          links: document.querySelectorAll('a').length,
          divs: document.querySelectorAll('div').length
        },
        hasErrorMessage: !!document.querySelector('.error, .error-message, [data-testid="error"]'),
        hasLoadingSpinner: !!document.querySelector('.loading, .spinner, [data-testid="loading"]'),
        workPageElements: {
          taskCards: document.querySelectorAll('[data-testid*="task"], .task-card, .task-item, .task').length,
          createButton: !!document.querySelector('button:has-text("Tạo"), button:has-text("Create"), button[aria-label*="tạo"], .create-button'),
          filterButtons: document.querySelectorAll('button[role="tab"], .filter-button, .tab-button, .filter').length,
          taskList: !!document.querySelector('.task-list, .tasks-container, [data-testid="task-list"], .tasks')
        }
      };
      
      // Try to run accessibility check if available
      if (window.debugConsole) {
        try {
          const accessibilityIssues = window.debugConsole.checkAccessibility();
          analysis.accessibilityIssues = accessibilityIssues.map(issue => ({
            element: issue.element,
            problems: issue.problems,
            selector: issue.selector
          }));
        } catch (error) {
          analysis.accessibilityError = error.message;
        }
      }
      
      return analysis;
    });
    
    // Take screenshot
    await page.screenshot({ 
      path: './work-page-current-state.png', 
      fullPage: true 
    });
    
    // Create comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      debugSuccess: true,
      pageAnalysis: pageAnalysis,
      consoleMessages: allConsoleMessages.slice(-20),
      networkErrors: networkErrors,
      navigationPath: [
        'http://localhost:3002',
        'Login process',
        finalUrl
      ]
    };
    
    // Save report
    fs.writeFileSync('./work-page-manual-debug.json', JSON.stringify(report, null, 2));
    
    // Display results
    displayManualDebugResults(report);
    
    // Generate specific fixes
    generateWorkPageSpecificFixes(report);
    
  } catch (error) {
    console.error('❌ Manual debug error:', error);
    
    // Save error report
    const errorReport = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      debugSuccess: false
    };
    
    fs.writeFileSync('./work-page-error-report.json', JSON.stringify(errorReport, null, 2));
  } finally {
    if (browser) {
      console.log('🔒 Keeping browser open for manual inspection...');
      // Don't close browser for manual inspection
      // await browser.close();
    }
  }
}

function displayManualDebugResults(report) {
  console.log('\n🎯 ===== KẾT QUẢ DEBUG TRANG CÔNG VIỆC =====');
  console.log(`📅 Thời gian: ${report.timestamp}`);
  console.log(`✅ Debug thành công: ${report.debugSuccess}`);
  
  const analysis = report.pageAnalysis;
  console.log(`🌐 URL hiện tại: ${analysis.url}`);
  console.log(`📄 Title: ${analysis.title}`);
  
  console.log('\n🔧 === TRẠNG THÁI TECHNICAL ===');
  console.log(`⚛️ React: ${analysis.hasReact ? '✅' : '❌'}`);
  console.log(`📋 TaskService: ${analysis.hasTaskService ? '✅' : '❌'}`);
  console.log(`🗄️ Supabase: ${analysis.hasSupabase ? '✅' : '❌'}`);
  
  console.log('\n📊 === ELEMENTS COUNT ===');
  Object.entries(analysis.elementCounts).forEach(([element, count]) => {
    console.log(`${element}: ${count}`);
  });
  
  console.log('\n📋 === WORK PAGE ELEMENTS ===');
  const workElements = analysis.workPageElements;
  console.log(`📝 Task Cards: ${workElements.taskCards}`);
  console.log(`➕ Create Button: ${workElements.createButton ? '✅' : '❌'}`);
  console.log(`🔽 Filter Buttons: ${workElements.filterButtons}`);
  console.log(`📋 Task List: ${workElements.taskList ? '✅' : '❌'}`);
  
  console.log('\n🚨 === STATUS CHECKS ===');
  console.log(`❌ Error Message: ${analysis.hasErrorMessage ? '⚠️ Has errors' : '✅ No errors'}`);
  console.log(`⏳ Loading: ${analysis.hasLoadingSpinner ? '⚠️ Still loading' : '✅ Loaded'}`);
  
  if (analysis.accessibilityIssues) {
    console.log('\n🔍 === ACCESSIBILITY ISSUES ===');
    console.log(`❌ Tìm thấy ${analysis.accessibilityIssues.length} vấn đề:`);
    analysis.accessibilityIssues.slice(0, 5).forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.element}: ${issue.problems.join(', ')}`);
    });
  }
  
  if (report.networkErrors.length > 0) {
    console.log('\n🌐 === NETWORK ERRORS ===');
    report.networkErrors.forEach(error => {
      console.log(`❌ ${error.status} ${error.url}`);
    });
  }
  
  console.log('\n📄 Body content preview:');
  console.log(analysis.bodyContent);
}

function generateWorkPageSpecificFixes(report) {
  console.log('\n🔧 ===== GIẢI PHÁP CỤ THỂ CHO TRANG CÔNG VIỆC =====');
  
  const fixes = [];
  const analysis = report.pageAnalysis;
  
  // Check if we're actually on work page
  if (!analysis.url.includes('/work')) {
    fixes.push({
      priority: 'CRITICAL',
      issue: 'Cannot access work page - routing issue',
      solution: 'Check routing configuration and authentication',
      action: 'Verify routes in src/App.tsx and authentication flow'
    });
  }
  
  // TaskService not available
  if (!analysis.hasTaskService) {
    fixes.push({
      priority: 'HIGH',
      issue: 'TaskService not available in browser',
      solution: 'Expose TaskService to window object',
      action: 'Add window.taskService = taskService in main.tsx'
    });
  }
  
  // No task elements found
  if (analysis.workPageElements.taskCards === 0) {
    fixes.push({
      priority: 'HIGH',
      issue: 'No task cards found',
      solution: 'Check task data loading and rendering',
      action: 'Debug TaskService.getTasks() and task list component'
    });
  }
  
  // No create button
  if (!analysis.workPageElements.createButton) {
    fixes.push({
      priority: 'MEDIUM',
      issue: 'Create task button not found',
      solution: 'Add create task button to work page',
      action: 'Check CreateTaskModal component and button rendering'
    });
  }
  
  // Accessibility issues
  if (analysis.accessibilityIssues && analysis.accessibilityIssues.length > 0) {
    fixes.push({
      priority: 'HIGH',
      issue: `${analysis.accessibilityIssues.length} accessibility issues`,
      solution: 'Add proper id, name, and aria-label attributes',
      action: 'Update form elements with accessibility attributes'
    });
  }
  
  // Network errors
  if (report.networkErrors.length > 0) {
    fixes.push({
      priority: 'HIGH',
      issue: `${report.networkErrors.length} network errors`,
      solution: 'Fix API endpoints and network requests',
      action: 'Check Supabase connection and API calls'
    });
  }
  
  // Save fixes
  fs.writeFileSync('./work-page-specific-fixes.json', JSON.stringify(fixes, null, 2));
  
  // Display fixes
  fixes.forEach((fix, index) => {
    const priorityIcon = fix.priority === 'CRITICAL' ? '🔴🔴' : 
                        fix.priority === 'HIGH' ? '🔴' : 
                        fix.priority === 'MEDIUM' ? '🟡' : '🟢';
    console.log(`${priorityIcon} ${index + 1}. [${fix.priority}] ${fix.issue}`);
    console.log(`   💡 Solution: ${fix.solution}`);
    console.log(`   🔧 Action: ${fix.action}`);
  });
  
  console.log('\n📄 Fixes saved to work-page-specific-fixes.json');
  console.log('📸 Screenshot saved to work-page-current-state.png');
  console.log('🌐 Browser kept open for manual inspection');
}

// Run manual debug
debugWorkPageManual().catch(console.error);
