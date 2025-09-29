const { chromium } = require('playwright');

async function testCreateTaskPerformance() {
  console.log('🎯 Testing create task performance after fixes...');
  
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
      
      console.log(`[${requestCount}] ${request.method()} ${request.url()}`);
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
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForTimeout(3000);
    
    console.log('📋 Step 6: Navigate to work page...');
    await page.goto('http://localhost:3001/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Step 7: Monitor for 15 seconds...');
    const startTime = Date.now();
    await page.waitForTimeout(15000);
    const endTime = Date.now();
    
    console.log('\n📊 === PERFORMANCE ANALYSIS ===');
    console.log(`Total requests in 15 seconds: ${requestCount}`);
    console.log(`Average requests per second: ${(requestCount / 15).toFixed(2)}`);
    
    if (requestCount > 100) {
      console.log('❌ SEVERE PERFORMANCE ISSUE - Too many requests!');
    } else if (requestCount > 50) {
      console.log('⚠️ MODERATE PERFORMANCE ISSUE - High request count');
    } else if (requestCount > 20) {
      console.log('⚠️ MINOR PERFORMANCE ISSUE - Elevated request count');
    } else {
      console.log('✅ PERFORMANCE GOOD - Normal request count');
    }
    
    // Analyze request patterns
    const taskRequests = requests.filter(r => r.url.includes('/tasks'));
    const userRequests = requests.filter(r => r.url.includes('/users'));
    const contextRequests = requests.filter(r => r.url.includes('/rpc/set_user_context'));
    
    console.log('\n🔍 === REQUEST BREAKDOWN ===');
    console.log(`Task requests: ${taskRequests.length}`);
    console.log(`User requests: ${userRequests.length}`);
    console.log(`Context requests: ${contextRequests.length}`);
    
    // Test create task button
    console.log('\n🚀 Step 8: Test create task button...');
    try {
      const createButton = await page.locator('button:has-text("Tạo công việc")').first();
      if (await createButton.isVisible()) {
        console.log('✅ Create task button found and visible');
        
        const beforeClickRequests = requestCount;
        await createButton.click();
        await page.waitForTimeout(3000);
        const afterClickRequests = requestCount;
        
        console.log(`📊 Requests triggered by create button: ${afterClickRequests - beforeClickRequests}`);
        
        if (afterClickRequests - beforeClickRequests > 10) {
          console.log('⚠️ Create button triggers too many requests');
        } else {
          console.log('✅ Create button performance is good');
        }
      } else {
        console.log('❌ Create task button not found');
      }
    } catch (error) {
      console.log('❌ Error testing create button:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testCreateTaskPerformance().catch(console.error);
