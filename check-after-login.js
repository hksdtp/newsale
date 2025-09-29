const { chromium } = require('playwright');

async function checkAfterLogin() {
  console.log('🎯 Check Status After Login...');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capture console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[ERROR] ${msg.text()}`);
    }
  });

  try {
    console.log('📍 Step 1: Complete authentication flow...');
    
    // Navigate to main app
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    
    // Region Selection
    if (page.url().includes('region-selection')) {
      await page.click('button:has-text("Hà Nội")');
      await page.waitForTimeout(1000);
    }
    
    // Team Selection
    if (page.url().includes('team-selection')) {
      await page.waitForTimeout(3000);
      await page.click('button:has-text("NHÓM 3 - Trịnh Thị Bốn")');
      await page.waitForTimeout(1000);
    }
    
    // User Selection
    if (page.url().includes('user-selection')) {
      await page.waitForTimeout(3000);
      await page.click('button:has-text("Trịnh Thị Bốn")');
      await page.waitForTimeout(1000);
    }
    
    // Password Entry
    if (page.url().includes('password')) {
      await page.waitForTimeout(2000);
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(5000); // Wait longer after login
    }
    
    console.log('📍 Step 2: Check post-login status...');
    console.log(`Current URL: ${page.url()}`);
    
    // Check localStorage
    const authData = await page.evaluate(() => {
      return {
        auth_user: localStorage.getItem('auth_user'),
        currentUserId: localStorage.getItem('currentUserId'),
        currentUserEmail: localStorage.getItem('currentUserEmail'),
        currentUserName: localStorage.getItem('currentUserName'),
        allKeys: Object.keys(localStorage)
      };
    });
    
    console.log('📊 Authentication Data:', authData);
    
    if (authData.auth_user) {
      console.log('✅ User is authenticated!');
      
      // Try to navigate to work page manually
      console.log('📍 Step 3: Manually navigate to work page...');
      
      // First try to go to dashboard
      await page.goto('http://localhost:3002/dashboard', { timeout: 15000 });
      await page.waitForTimeout(3000);
      console.log(`Dashboard URL: ${page.url()}`);
      
      // Then try work page
      await page.goto('http://localhost:3002/dashboard/work', { timeout: 15000 });
      await page.waitForTimeout(5000);
      console.log(`Work page URL: ${page.url()}`);
      
      if (page.url().includes('/dashboard/work')) {
        console.log('✅ Successfully reached work page!');
        
        // Take screenshot
        await page.screenshot({ path: 'work-page-reached.png', fullPage: true });
        
        // Check page content
        const pageContent = await page.evaluate(() => {
          return {
            title: document.title,
            elementCount: document.querySelectorAll('*').length,
            buttonCount: document.querySelectorAll('button').length,
            hasTaskElements: document.querySelectorAll('[class*="task"], [data-testid*="task"]').length > 0,
            bodyText: document.body.textContent?.substring(0, 200) || ''
          };
        });
        
        console.log('📊 Work Page Content:', pageContent);
        
        // Wait for any async loading
        console.log('📍 Step 4: Wait for async content...');
        await page.waitForTimeout(10000);
        
        // Check again
        const finalContent = await page.evaluate(() => {
          return {
            buttonCount: document.querySelectorAll('button').length,
            taskElements: document.querySelectorAll('[class*="task"], [data-testid*="task"]').length,
            buttonTexts: Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text).slice(0, 10)
          };
        });
        
        console.log('📊 Final Content:', finalContent);
        
      } else {
        console.log('❌ Could not reach work page');
        console.log(`Redirected to: ${page.url()}`);
      }
      
    } else {
      console.log('❌ User is not authenticated');
      console.log('Available localStorage keys:', authData.allKeys);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'check-after-login-error.png' });
  } finally {
    await browser.close();
  }
}

checkAfterLogin().catch(console.error);
