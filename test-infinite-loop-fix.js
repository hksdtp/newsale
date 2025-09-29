const { chromium } = require('playwright');

async function testInfiniteLoopFix() {
  console.log('🔧 Testing infinite loop fix...');
  
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
      
      // Log every 10 requests to monitor
      if (requestCount % 10 === 0) {
        console.log(`📊 Request count: ${requestCount}`);
      }
    }
  });
  
  try {
    console.log('🌐 Navigating to work page...');
    await page.goto('http://localhost:3001/dashboard/work', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('⏳ Waiting 10 seconds to monitor API calls...');
    await page.waitForTimeout(10000);
    
    console.log('\n📊 === API CALL ANALYSIS ===');
    console.log(`Total requests in 10 seconds: ${requestCount}`);
    
    if (requestCount > 50) {
      console.log('❌ INFINITE LOOP STILL EXISTS!');
      console.log('Recent requests:');
      requests.slice(-10).forEach((req, index) => {
        console.log(`   ${index + 1}. ${req.method} ${req.url}`);
      });
    } else if (requestCount > 20) {
      console.log('⚠️ HIGH API USAGE - May still have issues');
    } else {
      console.log('✅ API USAGE NORMAL - Infinite loop fixed!');
    }
    
    // Check for specific patterns
    const taskRequests = requests.filter(r => r.url.includes('/tasks?'));
    const userRequests = requests.filter(r => r.url.includes('/users?'));
    const contextRequests = requests.filter(r => r.url.includes('/rpc/set_user_context'));
    
    console.log('\n🔍 === REQUEST BREAKDOWN ===');
    console.log(`Tasks requests: ${taskRequests.length}`);
    console.log(`Users requests: ${userRequests.length}`);
    console.log(`Context requests: ${contextRequests.length}`);
    
    if (taskRequests.length > 10 || userRequests.length > 10 || contextRequests.length > 10) {
      console.log('❌ Still have repetitive requests!');
      
      // Show patterns
      if (taskRequests.length > 5) {
        console.log('\nTask request pattern:');
        taskRequests.slice(0, 5).forEach((req, i) => {
          console.log(`   ${i + 1}. ${req.url}`);
        });
      }
    } else {
      console.log('✅ Request patterns look healthy!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testInfiniteLoopFix().catch(console.error);
