const { chromium } = require('playwright');

async function testSimplePerformance() {
  console.log('🎯 Testing simple performance after fixes...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const page = await browser.newPage();
  
  // Track network requests
  const requests = [];
  let requestCount = 0;
  
  page.on('request', request => {
    if (request.url().includes('supabase.co')) {
      requestCount++;
      requests.push({
        url: request.url(),
        method: request.method(),
        timestamp: Date.now()
      });
      
      if (requestCount <= 20) {
        console.log(`[${requestCount}] ${request.method()} ${request.url()}`);
      } else if (requestCount % 10 === 0) {
        console.log(`[${requestCount}] ... (showing every 10th request)`);
      }
    }
  });
  
  try {
    console.log('🌐 Step 1: Navigate to app...');
    await page.goto('http://localhost:3001/', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('🏙️ Step 2: Select Hà Nội...');
    await page.click('button:has-text("Hà Nội")');
    await page.waitForTimeout(2000);
    
    console.log('👥 Step 3: Select team...');
    await page.click('button:has-text("NHÓM 3 - Trịnh Thị Bốn")');
    await page.waitForTimeout(2000);
    
    console.log('👤 Step 4: Select user...');
    await page.click('button:has-text("Trịnh Thị Bốn")');
    await page.waitForTimeout(2000);
    
    console.log('🔐 Step 5: Enter password...');
    await page.fill('input[type="password"]', '123456');
    
    // Try different login button selectors
    const loginSelectors = [
      'button:has-text("Đăng nhập")',
      'button[type="submit"]',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
      '.login-button',
      '[data-testid="login-button"]'
    ];
    
    let loginSuccess = false;
    for (const selector of loginSelectors) {
      try {
        const button = await page.locator(selector).first();
        if (await button.isVisible({ timeout: 2000 })) {
          console.log(`✅ Found login button with selector: ${selector}`);
          await button.click();
          loginSuccess = true;
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!loginSuccess) {
      console.log('❌ Could not find login button, checking page content...');
      const pageContent = await page.content();
      console.log('Page title:', await page.title());
      
      // Check if already logged in
      if (pageContent.includes('dashboard') || pageContent.includes('Dashboard')) {
        console.log('✅ Seems like already on dashboard');
        loginSuccess = true;
      }
    }
    
    if (loginSuccess) {
      await page.waitForTimeout(3000);
      
      console.log('📋 Step 6: Navigate to work page...');
      await page.goto('http://localhost:3001/dashboard/work', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      console.log('⏳ Step 7: Monitor for 10 seconds...');
      const beforeMonitor = requestCount;
      await page.waitForTimeout(10000);
      const afterMonitor = requestCount;
      
      console.log('\n📊 === PERFORMANCE ANALYSIS ===');
      console.log(`Total requests: ${requestCount}`);
      console.log(`Requests during monitoring: ${afterMonitor - beforeMonitor}`);
      
      if (afterMonitor - beforeMonitor > 50) {
        console.log('❌ INFINITE LOOP STILL EXISTS!');
      } else if (afterMonitor - beforeMonitor > 20) {
        console.log('⚠️ HIGH API USAGE - May have issues');
      } else {
        console.log('✅ API USAGE NORMAL - Performance looks good!');
      }
      
      // Check for create task button
      try {
        const createButton = await page.locator('button:has-text("Tạo công việc")').first();
        if (await createButton.isVisible({ timeout: 5000 })) {
          console.log('✅ Create task button is visible and ready');
        } else {
          console.log('❌ Create task button not found');
        }
      } catch (error) {
        console.log('❌ Error checking create button:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testSimplePerformance().catch(console.error);
