const { chromium } = require('playwright');
const fs = require('fs');

async function debugWorkPageWithLogin() {
  console.log('🎯 Starting Playwright Work Page Debug with Login...');

  const browser = await chromium.launch({
    headless: false,
    devtools: true,
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();

  // Capture console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
    };
    consoleMessages.push(message);
    if (msg.type() === 'error' || msg.type() === 'warning') {
      console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    }
  });

  try {
    console.log('📍 Step 1: Navigate to main app...');
    await page.goto('http://localhost:3002', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('📍 Step 2: Check if login is needed...');
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    if (currentUrl.includes('region-selection')) {
      console.log('📍 Step 3: Select region...');
      // Try to find and click region button
      try {
        await page.click('button:has-text("Hà Nội")', { timeout: 5000 });
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log('Region selection not found, trying alternative...');
        await page.click('button[type="submit"]', { timeout: 5000 });
        await page.waitForTimeout(2000);
      }
    }

    if (page.url().includes('password')) {
      console.log('📍 Step 4: Enter password...');
      await page.fill('input[type="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }

    console.log('📍 Step 5: Navigate to work page...');
    await page.goto('http://localhost:3002/dashboard/work', {
      waitUntil: 'networkidle',
      timeout: 30000,
    });

    console.log('⏳ Waiting for work page to load completely...');
    await page.waitForTimeout(8000);

    console.log('📍 Step 6: Reading debug script...');
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');

    console.log('📍 Step 7: Injecting debug script...');
    await page.evaluate(debugScript);

    console.log('📍 Step 8: Running work page specific checks...');

    // Check for work page specific elements
    const workPageElements = await page.evaluate(() => {
      const elements = {
        taskCards: document.querySelectorAll('[data-testid*="task"], .task-card, .task-item')
          .length,
        filterButtons: document.querySelectorAll('button').length,
        createTaskButton: document.querySelectorAll('button').length,
        searchInput: document.querySelectorAll(
          'input[type="text"], input[placeholder*="search"], input[placeholder*="tìm"]'
        ).length,
        tabs: document.querySelectorAll('[role="tab"], .tab').length,
        allButtons: Array.from(document.querySelectorAll('button'))
          .map(btn => ({
            text: btn.textContent?.trim() || '',
            id: btn.id || '',
            className: btn.className || '',
          }))
          .slice(0, 10), // First 10 buttons for analysis
      };
      return elements;
    });

    console.log('📍 Step 9: Running accessibility check...');
    const accessibilityResults = await page.evaluate(() => {
      if (typeof window.checkAccessibility === 'function') {
        return window.checkAccessibility();
      }
      return { error: 'checkAccessibility function not found' };
    });

    console.log('📍 Step 10: Running performance check...');
    const performanceResults = await page.evaluate(() => {
      if (typeof window.checkPerformance === 'function') {
        return window.checkPerformance();
      }
      return { error: 'checkPerformance function not found' };
    });

    console.log('📍 Step 11: Checking TaskService...');
    const taskServiceResults = await page.evaluate(() => {
      if (typeof window.debugTaskService === 'function') {
        return window.debugTaskService();
      }
      return { error: 'debugTaskService function not found' };
    });

    console.log('📍 Step 12: Getting page info...');
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        elementCounts: {
          total: document.querySelectorAll('*').length,
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          forms: document.querySelectorAll('form').length,
          links: document.querySelectorAll('a').length,
          divs: document.querySelectorAll('div').length,
        },
      };
    });

    console.log('📍 Step 13: Taking screenshot...');
    await page.screenshot({
      path: 'work-page-final-debug.png',
      fullPage: true,
    });

    // Compile final report
    const finalReport = {
      pageInfo,
      workPageElements,
      accessibility: accessibilityResults,
      performance: performanceResults,
      taskService: taskServiceResults,
      consoleMessages: consoleMessages.slice(-100), // Last 100 messages
      timestamp: new Date().toISOString(),
    };

    console.log('📍 Step 14: Saving debug report...');
    fs.writeFileSync('work-page-final-debug-report.json', JSON.stringify(finalReport, null, 2));

    console.log('✅ Debug completed successfully!');
    console.log('📊 Report saved to: work-page-final-debug-report.json');
    console.log('📸 Screenshot saved to: work-page-final-debug.png');

    // Print summary
    console.log('\n🎯 WORK PAGE DEBUG SUMMARY:');
    console.log(`📄 Page: ${pageInfo.title}`);
    console.log(`🔗 URL: ${pageInfo.url}`);
    console.log(`📊 Total Elements: ${pageInfo.elementCounts.total}`);
    console.log(`🔘 Buttons: ${pageInfo.elementCounts.buttons}`);
    console.log(`📝 Inputs: ${pageInfo.elementCounts.inputs}`);
    console.log(`📋 Forms: ${pageInfo.elementCounts.forms}`);

    console.log('\n🎯 WORK PAGE SPECIFIC:');
    console.log(`📋 Task Cards: ${workPageElements.taskCards}`);
    console.log(`🔍 Filter Buttons: ${workPageElements.filterButtons}`);
    console.log(`➕ Create Task Button: ${workPageElements.createTaskButton}`);
    console.log(`🔍 Search Input: ${workPageElements.searchInput}`);
    console.log(`📑 Tabs: ${workPageElements.tabs}`);

    if (accessibilityResults && accessibilityResults.issues) {
      console.log(`\n⚠️  ACCESSIBILITY ISSUES: ${accessibilityResults.issues.length}`);
      accessibilityResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.element}: ${issue.problems.join(', ')}`);
      });
    }

    if (performanceResults && performanceResults.metrics) {
      console.log(`\n⚡ PERFORMANCE: Load Time: ${performanceResults.loadTime}ms`);
    }
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugWorkPageWithLogin().catch(console.error);
