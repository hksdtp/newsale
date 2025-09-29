const { chromium } = require('playwright');

async function debugUserSelectionPage() {
  console.log('🎯 Debug User Selection Page...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture ALL console messages
  const allConsoleMessages = [];
  page.on('console', msg => {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };
    allConsoleMessages.push(message);
    console.log(`[${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  
  // Capture network requests
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      timestamp: new Date().toISOString()
    });
    if (request.url().includes('supabase') || request.url().includes('users')) {
      console.log(`[REQUEST] ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('supabase') || response.url().includes('users')) {
      console.log(`[RESPONSE] ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('📍 Step 1: Navigate directly to user selection page...');
    
    // Navigate directly to user selection with correct parameters
    const userSelectionUrl = 'http://localhost:3002/auth/user-selection?location=Hà Nội&teamId=b082cb9a-e620-478b-b9f0-d170175cbfef';
    await page.goto(userSelectionUrl);
    
    console.log('📍 Step 2: Wait for page to load...');
    await page.waitForTimeout(5000);
    
    console.log('📍 Step 3: Check page state...');
    
    // Check if page is loading
    const isLoading = await page.evaluate(() => {
      const loadingElements = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="animate-spin"]');
      return loadingElements.length > 0;
    });
    
    console.log(`Loading state: ${isLoading}`);
    
    // Check for error messages
    const errorMessages = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[class*="error"], [class*="text-red"]');
      return Array.from(errorElements).map(el => el.textContent?.trim()).filter(text => text);
    });
    
    console.log('Error messages:', errorMessages);
    
    // Check for user buttons
    const userButtons = await page.$$('button[class*="w-full p-6"]');
    console.log(`User buttons found: ${userButtons.length}`);
    
    // Get all button texts
    const allButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(btn => ({
        text: btn.textContent?.trim() || '',
        className: btn.className || '',
        disabled: btn.disabled
      }));
    });
    
    console.log('All buttons on page:', allButtons);
    
    // Check page content
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.textContent?.substring(0, 500) || '',
        hasReactRoot: !!document.querySelector('[data-reactroot]'),
        elementCount: document.querySelectorAll('*').length
      };
    });
    
    console.log('Page content:', pageContent);
    
    // Wait longer and check again
    console.log('📍 Step 4: Wait longer and check again...');
    await page.waitForTimeout(10000);
    
    const userButtonsAfterWait = await page.$$('button[class*="w-full p-6"]');
    console.log(`User buttons after wait: ${userButtonsAfterWait.length}`);
    
    // Check localStorage
    const localStorageData = await page.evaluate(() => {
      return {
        auth_user: localStorage.getItem('auth_user'),
        currentUserId: localStorage.getItem('currentUserId'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('LocalStorage:', localStorageData);
    
    // Take screenshot
    await page.screenshot({ path: 'debug-user-selection-detailed.png', fullPage: true });
    
    // Try to manually trigger the API call
    console.log('📍 Step 5: Manually test API call...');
    
    const manualApiTest = await page.evaluate(async () => {
      try {
        // Check if authService is available
        if (typeof window.authService !== 'undefined') {
          console.log('authService is available');
          const users = await window.authService.getUsersByTeamAndLocation(
            'b082cb9a-e620-478b-b9f0-d170175cbfef', 
            'Hà Nội'
          );
          return { success: true, users };
        } else {
          return { success: false, error: 'authService not available' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('Manual API test result:', manualApiTest);
    
    // Save detailed report
    const detailedReport = {
      pageContent,
      isLoading,
      errorMessages,
      userButtonsCount: userButtons.length,
      allButtons,
      localStorageData,
      manualApiTest,
      consoleMessages: allConsoleMessages,
      networkRequests,
      timestamp: new Date().toISOString()
    };
    
    require('fs').writeFileSync('user-selection-debug-report.json', JSON.stringify(detailedReport, null, 2));
    console.log('📊 Detailed report saved to: user-selection-debug-report.json');
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  } finally {
    await browser.close();
  }
}

debugUserSelectionPage().catch(console.error);
