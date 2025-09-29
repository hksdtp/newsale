const { chromium } = require('playwright');
const fs = require('fs');

async function completeAuthFlowAndDebugWork() {
  console.log('🎯 Starting Complete Auth Flow + Work Page Debug...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
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
    } else if (msg.type() === 'warning') {
      console.log(`[WARNING] ${msg.text()}`);
    }
  });

  try {
    console.log('📍 Step 1: Navigate to main app...');
    await page.goto('http://localhost:3002', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    console.log(`Current URL: ${page.url()}`);
    
    // Step 2: Region Selection
    if (page.url().includes('region-selection')) {
      console.log('📍 Step 2: Selecting Hà Nội region...');
      await page.click('button:has-text("Hà Nội")');
      await page.waitForTimeout(1000);
      console.log(`After region selection: ${page.url()}`);
    }
    
    // Step 3: Team Selection
    if (page.url().includes('team-selection')) {
      console.log('📍 Step 3: Waiting for teams to load...');
      await page.waitForTimeout(3000);
      
      // Try to select first team
      const teamButtons = await page.$$('button:has-text("Nhóm")');
      if (teamButtons.length > 0) {
        console.log(`Found ${teamButtons.length} teams, selecting first one...`);
        await teamButtons[0].click();
        await page.waitForTimeout(1000);
        console.log(`After team selection: ${page.url()}`);
      } else {
        console.log('No teams found, trying alternative selector...');
        await page.click('button[class*="w-full p-6"]');
        await page.waitForTimeout(1000);
      }
    }
    
    // Step 4: User Selection
    if (page.url().includes('user-selection')) {
      console.log('📍 Step 4: Waiting for users to load...');
      await page.waitForTimeout(3000);
      
      // Try to select "Trịnh Thị Bốn" user
      try {
        await page.click('button:has-text("Trịnh Thị Bốn")');
        console.log('Selected user: Trịnh Thị Bốn');
      } catch (e) {
        console.log('User not found, selecting first available user...');
        const userButtons = await page.$$('button[class*="w-full p-6"]');
        if (userButtons.length > 0) {
          await userButtons[0].click();
        }
      }
      await page.waitForTimeout(1000);
      console.log(`After user selection: ${page.url()}`);
    }
    
    // Step 5: Password Entry
    if (page.url().includes('password')) {
      console.log('📍 Step 5: Entering password...');
      await page.waitForTimeout(2000);
      
      // Try default password first
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      // If still on password page, try admin123
      if (page.url().includes('password')) {
        console.log('Default password failed, trying admin123...');
        await page.fill('input[type="password"]', 'admin123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);
      }
      
      console.log(`After password: ${page.url()}`);
    }
    
    // Step 6: Navigate to Work Page
    console.log('📍 Step 6: Navigating to work page...');
    await page.goto('http://localhost:3002/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for work page to fully load...');
    await page.waitForTimeout(10000); // Wait longer for tasks to load
    
    console.log(`Final URL: ${page.url()}`);
    
    // Step 7: Inject Debug Script
    console.log('📍 Step 7: Injecting debug script...');
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
    await page.evaluate(debugScript);
    
    // Step 8: Run Debug Analysis
    console.log('📍 Step 8: Running complete debug analysis...');
    
    const debugResults = await page.evaluate(() => {
      if (typeof window.runCompleteDebug === 'function') {
        return window.runCompleteDebug();
      }
      return { error: 'runCompleteDebug function not found' };
    });
    
    // Step 9: Get Work Page Specific Info
    console.log('📍 Step 9: Analyzing work page elements...');
    
    const workPageAnalysis = await page.evaluate(() => {
      const analysis = {
        url: window.location.href,
        title: document.title,
        isWorkPage: window.location.href.includes('/dashboard/work'),
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
        reactComponents: document.querySelectorAll('[data-reactroot], [data-react-component]').length
      };
      
      return analysis;
    });
    
    // Step 10: Take Screenshot
    console.log('📍 Step 10: Taking final screenshot...');
    await page.screenshot({ 
      path: 'work-page-complete-debug.png', 
      fullPage: true 
    });
    
    // Compile Final Report
    const finalReport = {
      authFlow: {
        completed: workPageAnalysis.isWorkPage,
        finalUrl: workPageAnalysis.url,
        steps: [
          'region-selection',
          'team-selection', 
          'user-selection',
          'password',
          'dashboard/work'
        ]
      },
      workPageAnalysis,
      debugResults,
      errors,
      consoleMessages: consoleMessages.slice(-50),
      timestamp: new Date().toISOString()
    };
    
    console.log('📍 Step 11: Saving complete report...');
    fs.writeFileSync('work-page-complete-debug-report.json', JSON.stringify(finalReport, null, 2));
    
    console.log('✅ Complete debug analysis finished!');
    console.log('📊 Report saved to: work-page-complete-debug-report.json');
    console.log('📸 Screenshot saved to: work-page-complete-debug.png');
    
    // Print Summary
    console.log('\n🎯 FINAL SUMMARY:');
    console.log(`📄 Page Title: ${workPageAnalysis.title}`);
    console.log(`🔗 Final URL: ${workPageAnalysis.url}`);
    console.log(`✅ Reached Work Page: ${workPageAnalysis.isWorkPage ? 'YES' : 'NO'}`);
    console.log(`📊 Total Elements: ${workPageAnalysis.elements.total}`);
    console.log(`🔘 Buttons: ${workPageAnalysis.elements.buttons}`);
    console.log(`📋 Task Elements: ${workPageAnalysis.elements.taskElements}`);
    console.log(`❌ Errors Found: ${errors.length}`);
    
    if (workPageAnalysis.buttonTexts.length > 0) {
      console.log('\n🔘 Button Texts Found:');
      workPageAnalysis.buttonTexts.forEach((text, index) => {
        console.log(`${index + 1}. "${text}"`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error during complete flow:', error);
  } finally {
    await browser.close();
  }
}

// Run the complete flow
completeAuthFlowAndDebugWork().catch(console.error);
