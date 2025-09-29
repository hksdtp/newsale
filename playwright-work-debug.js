const { chromium } = require('playwright');
const fs = require('fs');

async function debugWorkPage() {
  console.log('🎯 Starting Playwright Work Page Debug...');
  
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
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    consoleMessages.push(message);
    console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  try {
    console.log('📍 Step 1: Navigate to work page...');
    await page.goto('http://localhost:3002/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting for page to load completely...');
    await page.waitForTimeout(5000);
    
    console.log('📍 Step 2: Reading debug script...');
    const debugScript = fs.readFileSync('./manual-debug-console.js', 'utf8');
    
    console.log('📍 Step 3: Injecting debug script...');
    await page.evaluate(debugScript);
    
    console.log('📍 Step 4: Running accessibility check...');
    const accessibilityResults = await page.evaluate(() => {
      if (typeof window.checkAccessibility === 'function') {
        return window.checkAccessibility();
      }
      return { error: 'checkAccessibility function not found' };
    });
    
    console.log('📍 Step 5: Running performance check...');
    const performanceResults = await page.evaluate(() => {
      if (typeof window.checkPerformance === 'function') {
        return window.checkPerformance();
      }
      return { error: 'checkPerformance function not found' };
    });
    
    console.log('📍 Step 6: Checking React errors...');
    const reactResults = await page.evaluate(() => {
      if (typeof window.checkReactErrors === 'function') {
        return window.checkReactErrors();
      }
      return { error: 'checkReactErrors function not found' };
    });
    
    console.log('📍 Step 7: Getting page info...');
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
          links: document.querySelectorAll('a').length
        }
      };
    });
    
    console.log('📍 Step 8: Taking screenshot...');
    await page.screenshot({ 
      path: 'work-page-debug.png', 
      fullPage: true 
    });
    
    // Compile final report
    const finalReport = {
      pageInfo,
      accessibility: accessibilityResults,
      performance: performanceResults,
      react: reactResults,
      consoleMessages: consoleMessages.slice(-50), // Last 50 messages
      timestamp: new Date().toISOString()
    };
    
    console.log('📍 Step 9: Saving debug report...');
    fs.writeFileSync('work-page-debug-report.json', JSON.stringify(finalReport, null, 2));
    
    console.log('✅ Debug completed successfully!');
    console.log('📊 Report saved to: work-page-debug-report.json');
    console.log('📸 Screenshot saved to: work-page-debug.png');
    
    // Print summary
    console.log('\n🎯 SUMMARY:');
    console.log(`📄 Page: ${pageInfo.title}`);
    console.log(`🔗 URL: ${pageInfo.url}`);
    console.log(`📊 Elements: ${pageInfo.elementCounts.total} total`);
    console.log(`🔘 Buttons: ${pageInfo.elementCounts.buttons}`);
    console.log(`📝 Inputs: ${pageInfo.elementCounts.inputs}`);
    console.log(`📋 Forms: ${pageInfo.elementCounts.forms}`);
    
    if (accessibilityResults && accessibilityResults.issues) {
      console.log(`⚠️  Accessibility Issues: ${accessibilityResults.issues.length}`);
    }
    
    if (performanceResults && performanceResults.metrics) {
      console.log(`⚡ Performance: ${JSON.stringify(performanceResults.metrics)}`);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await browser.close();
  }
}

// Run the debug
debugWorkPage().catch(console.error);
