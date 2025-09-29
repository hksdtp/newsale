const { chromium } = require('playwright');
const fs = require('fs');

async function finalWorkPageDebug() {
  console.log('🎯 Final Work Page Debug - Complete Flow...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  const consoleMessages = [];
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

  try {
    console.log('📍 Step 1: Navigate to main app...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    
    // Step 2: Region Selection
    if (page.url().includes('region-selection')) {
      console.log('📍 Step 2: Selecting Hà Nội region...');
      await page.click('button:has-text("Hà Nội")');
      await page.waitForTimeout(1000);
    }
    
    // Step 3: Team Selection
    if (page.url().includes('team-selection')) {
      console.log('📍 Step 3: Selecting team with Trịnh Thị Bốn...');
      await page.waitForTimeout(3000);
      await page.click('button:has-text("NHÓM 3 - Trịnh Thị Bốn")');
      await page.waitForTimeout(1000);
    }
    
    // Step 4: User Selection
    if (page.url().includes('user-selection')) {
      console.log('📍 Step 4: Selecting Trịnh Thị Bốn...');
      await page.waitForTimeout(3000);
      
      // Use correct selector for user button (p-4 not p-6)
      await page.click('button:has-text("Trịnh Thị Bốn")');
      await page.waitForTimeout(1000);
    }
    
    // Step 5: Password Entry
    if (page.url().includes('password')) {
      console.log('📍 Step 5: Entering password...');
      await page.waitForTimeout(2000);
      
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    
    // Step 6: Navigate to Work Page
    console.log('📍 Step 6: Navigating to work page...');
    await page.goto('http://localhost:3002/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for work page to fully load...');
    await page.waitForTimeout(10000);
    
    console.log(`Final URL: ${page.url()}`);
    
    // Step 7: Check if we reached work page
    if (page.url().includes('/dashboard/work')) {
      console.log('✅ Successfully reached work page!');
      
      // Step 8: Inject Debug Script
      console.log('📍 Step 8: Injecting debug script...');
      const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
      await page.evaluate(debugScript);
      
      // Step 9: Run Complete Debug
      console.log('📍 Step 9: Running complete debug analysis...');
      
      const debugResults = await page.evaluate(() => {
        if (typeof window.runCompleteDebug === 'function') {
          return window.runCompleteDebug();
        }
        return { error: 'runCompleteDebug function not found' };
      });
      
      // Step 10: Get Work Page Analysis
      console.log('📍 Step 10: Analyzing work page...');
      
      const workPageAnalysis = await page.evaluate(() => {
        return {
          url: window.location.href,
          title: document.title,
          elements: {
            total: document.querySelectorAll('*').length,
            buttons: document.querySelectorAll('button').length,
            inputs: document.querySelectorAll('input').length,
            taskElements: document.querySelectorAll('[data-testid*="task"], .task-card, .task-item, [class*="task"]').length,
            tabElements: document.querySelectorAll('[role="tab"], .tab, [class*="tab"]').length
          },
          buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text).slice(0, 20),
          hasTaskService: typeof window.taskService !== 'undefined',
          hasSupabase: typeof window.supabase !== 'undefined',
          localStorage: {
            auth_user: localStorage.getItem('auth_user'),
            currentUserId: localStorage.getItem('currentUserId'),
            currentUserEmail: localStorage.getItem('currentUserEmail'),
            currentUserName: localStorage.getItem('currentUserName')
          }
        };
      });
      
      // Step 11: Take Screenshot
      console.log('📍 Step 11: Taking screenshot...');
      await page.screenshot({ 
        path: 'final-work-page-success.png', 
        fullPage: true 
      });
      
      // Compile Final Report
      const finalReport = {
        success: true,
        workPageAnalysis,
        debugResults,
        errors,
        consoleMessages: consoleMessages.slice(-100),
        timestamp: new Date().toISOString()
      };
      
      console.log('📍 Step 12: Saving final report...');
      fs.writeFileSync('final-work-page-debug-report.json', JSON.stringify(finalReport, null, 2));
      
      console.log('✅ WORK PAGE DEBUG COMPLETED SUCCESSFULLY!');
      console.log('📊 Report saved to: final-work-page-debug-report.json');
      console.log('📸 Screenshot saved to: final-work-page-success.png');
      
      // Print Summary
      console.log('\n🎯 WORK PAGE ANALYSIS SUMMARY:');
      console.log(`📄 Page Title: ${workPageAnalysis.title}`);
      console.log(`🔗 URL: ${workPageAnalysis.url}`);
      console.log(`📊 Total Elements: ${workPageAnalysis.elements.total}`);
      console.log(`🔘 Buttons: ${workPageAnalysis.elements.buttons}`);
      console.log(`📋 Task Elements: ${workPageAnalysis.elements.taskElements}`);
      console.log(`❌ Console Errors: ${errors.length}`);
      
      if (workPageAnalysis.localStorage.auth_user) {
        console.log(`✅ User Authenticated: ${workPageAnalysis.localStorage.currentUserName}`);
      } else {
        console.log(`❌ User Not Authenticated`);
      }
      
      if (workPageAnalysis.buttonTexts.length > 0) {
        console.log('\n🔘 Available Actions:');
        workPageAnalysis.buttonTexts.forEach((text, index) => {
          console.log(`${index + 1}. "${text}"`);
        });
      }
      
      if (errors.length > 0) {
        console.log('\n❌ ERRORS FOUND:');
        errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error.text}`);
        });
      }
      
    } else {
      console.log('❌ Failed to reach work page');
      console.log(`Current URL: ${page.url()}`);
      await page.screenshot({ path: 'final-debug-failed.png' });
    }
    
  } catch (error) {
    console.error('❌ Error during final debug:', error);
    await page.screenshot({ path: 'final-debug-error.png' });
  } finally {
    await browser.close();
  }
}

finalWorkPageDebug().catch(console.error);
