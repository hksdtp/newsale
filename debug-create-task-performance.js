const { chromium } = require('playwright');
const fs = require('fs');

async function debugCreateTaskPerformance() {
  console.log('🎯 Debug Create Task Performance...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages and network requests
  const consoleMessages = [];
  const networkRequests = [];
  const errors = [];
  
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(message);
    
    if (msg.type() === 'error') {
      errors.push(message);
      console.log(`[ERROR] ${msg.text()}`);
    }
  });
  
  page.on('request', request => {
    const requestData = {
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString(),
      resourceType: request.resourceType()
    };
    networkRequests.push(requestData);
    
    if (request.url().includes('supabase') || request.url().includes('tasks')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('tasks')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()} (${response.request().timing()?.responseEnd || 'N/A'}ms)`);
    }
  });

  try {
    console.log('📍 Step 1: Navigate to work page...');
    await page.goto('http://localhost:3001/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('📍 Step 2: Wait for page to load...');
    await page.waitForTimeout(5000);
    
    // Check if we're on the work page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    if (!currentUrl.includes('/dashboard/work')) {
      console.log('❌ Not on work page, need to login first...');
      
      // Quick login flow
      if (currentUrl.includes('region-selection')) {
        await page.click('button:has-text("Hà Nội")');
        await page.waitForTimeout(1000);
      }
      
      if (page.url().includes('team-selection')) {
        await page.waitForTimeout(2000);
        await page.click('button:has-text("NHÓM 3 - Trịnh Thị Bốn")');
        await page.waitForTimeout(1000);
      }
      
      if (page.url().includes('user-selection')) {
        await page.waitForTimeout(2000);
        await page.click('button:has-text("Trịnh Thị Bốn")');
        await page.waitForTimeout(1000);
      }
      
      if (page.url().includes('password')) {
        await page.fill('input[type="password"]', '123456');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      }
      
      // Navigate to work page again
      await page.goto('http://localhost:3001/dashboard/work');
      await page.waitForTimeout(5000);
    }
    
    console.log('📍 Step 3: Inject debug script...');
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
    await page.evaluate(debugScript);
    
    console.log('📍 Step 4: Find and click "Tạo công việc" button...');
    
    // Take screenshot before clicking
    await page.screenshot({ path: 'before-create-task.png' });
    
    // Find create task button
    const createTaskButton = await page.$('button:has-text("Tạo công việc")');
    if (!createTaskButton) {
      console.log('❌ Create task button not found');
      const allButtons = await page.$$eval('button', buttons => 
        buttons.map(btn => btn.textContent?.trim()).filter(text => text)
      );
      console.log('Available buttons:', allButtons);
      return;
    }
    
    console.log('✅ Found create task button');
    
    // Start performance monitoring
    const startTime = Date.now();
    
    // Click create task button
    await createTaskButton.click();
    console.log('📍 Step 5: Clicked create task button, monitoring performance...');
    
    // Wait for modal/form to appear
    await page.waitForTimeout(2000);
    
    // Check what happened after click
    const afterClickAnalysis = await page.evaluate(() => {
      return {
        url: window.location.href,
        modals: document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]').length,
        forms: document.querySelectorAll('form').length,
        overlays: document.querySelectorAll('[class*="overlay"], [class*="backdrop"]').length,
        loadingElements: document.querySelectorAll('[class*="loading"], [class*="spinner"], .animate-spin').length,
        newButtons: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text && (text.includes('Lưu') || text.includes('Hủy') || text.includes('Tạo'))),
        bodyText: document.body.textContent?.substring(0, 500) || ''
      };
    });
    
    console.log('📊 After click analysis:', afterClickAnalysis);
    
    // Take screenshot after clicking
    await page.screenshot({ path: 'after-create-task-click.png' });
    
    // Wait longer to see if anything loads
    console.log('📍 Step 6: Waiting for form/modal to fully load...');
    await page.waitForTimeout(10000);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log(`⏱️ Total time from click to load: ${totalTime}ms`);
    
    // Final analysis
    const finalAnalysis = await page.evaluate(() => {
      return {
        url: window.location.href,
        modals: document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]').length,
        forms: document.querySelectorAll('form').length,
        inputs: document.querySelectorAll('input, textarea, select').length,
        loadingElements: document.querySelectorAll('[class*="loading"], [class*="spinner"], .animate-spin').length,
        errorMessages: Array.from(document.querySelectorAll('[class*="error"], [class*="text-red"]')).map(el => el.textContent?.trim()).filter(text => text),
        hasTaskForm: !!document.querySelector('input[name*="task"], input[placeholder*="tên"], input[placeholder*="mô tả"]'),
        allInputs: Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
          type: input.type || input.tagName,
          name: input.name || '',
          placeholder: input.placeholder || '',
          id: input.id || ''
        }))
      };
    });
    
    console.log('📊 Final analysis:', finalAnalysis);
    
    // Take final screenshot
    await page.screenshot({ path: 'final-create-task-state.png', fullPage: true });
    
    // Compile report
    const performanceReport = {
      totalLoadTime: totalTime,
      afterClickAnalysis,
      finalAnalysis,
      errors,
      consoleMessages: consoleMessages.slice(-50),
      networkRequests: networkRequests.filter(req => req.timestamp > new Date(startTime).toISOString()),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('create-task-performance-report.json', JSON.stringify(performanceReport, null, 2));
    
    console.log('✅ Performance analysis completed!');
    console.log(`📊 Total load time: ${totalTime}ms`);
    console.log(`📊 Errors found: ${errors.length}`);
    console.log(`📊 Network requests: ${networkRequests.length}`);
    console.log('📄 Report saved to: create-task-performance-report.json');
    
    if (totalTime > 5000) {
      console.log('⚠️ SLOW PERFORMANCE DETECTED!');
      console.log('🔍 Analyzing potential causes...');
      
      // Analyze slow performance causes
      const slowCauses = [];
      
      if (networkRequests.length > 10) {
        slowCauses.push(`Too many network requests: ${networkRequests.length}`);
      }
      
      if (errors.length > 0) {
        slowCauses.push(`Console errors detected: ${errors.length}`);
      }
      
      if (finalAnalysis.loadingElements > 0) {
        slowCauses.push(`Loading elements still present: ${finalAnalysis.loadingElements}`);
      }
      
      console.log('🚨 Potential causes:', slowCauses);
    }
    
  } catch (error) {
    console.error('❌ Error during performance debug:', error);
    await page.screenshot({ path: 'create-task-error.png' });
  } finally {
    await browser.close();
  }
}

debugCreateTaskPerformance().catch(console.error);
