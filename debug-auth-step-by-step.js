const { chromium } = require('playwright');

async function debugAuthStepByStep() {
  console.log('🎯 Debug Authentication Step by Step...');
  
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
    console.log('📍 Step 1: Navigate to main app...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(3000);
    console.log(`Current URL: ${page.url()}`);
    
    // Step 2: Region Selection
    if (page.url().includes('region-selection')) {
      console.log('📍 Step 2: Selecting Hà Nội region...');
      
      // Take screenshot before selection
      await page.screenshot({ path: 'debug-step2-before.png' });
      
      // Click Hà Nội button
      await page.click('button:has-text("Hà Nội")');
      await page.waitForTimeout(2000);
      
      console.log(`After region selection: ${page.url()}`);
      await page.screenshot({ path: 'debug-step2-after.png' });
    }
    
    // Step 3: Team Selection
    if (page.url().includes('team-selection')) {
      console.log('📍 Step 3: Team selection...');
      await page.waitForTimeout(3000);
      
      // Take screenshot
      await page.screenshot({ path: 'debug-step3-teams.png' });
      
      // Get all team buttons
      const teamButtons = await page.$$('button[class*="w-full p-6"]');
      console.log(`Found ${teamButtons.length} team buttons`);
      
      if (teamButtons.length > 0) {
        // Get team names
        for (let i = 0; i < teamButtons.length; i++) {
          const teamText = await teamButtons[i].textContent();
          console.log(`Team ${i + 1}: ${teamText?.trim()}`);
        }
        
        // Look for team with "Trịnh Thị Bốn"
        let targetTeamIndex = -1;
        for (let i = 0; i < teamButtons.length; i++) {
          const teamText = await teamButtons[i].textContent();
          if (teamText?.includes('Trịnh Thị Bốn')) {
            targetTeamIndex = i;
            break;
          }
        }
        
        if (targetTeamIndex >= 0) {
          console.log(`Selecting team with Trịnh Thị Bốn (index ${targetTeamIndex})`);
          await teamButtons[targetTeamIndex].click();
        } else {
          console.log('Team with Trịnh Thị Bốn not found, selecting first team');
          await teamButtons[0].click();
        }
        
        await page.waitForTimeout(2000);
        console.log(`After team selection: ${page.url()}`);
      }
    }
    
    // Step 4: User Selection
    if (page.url().includes('user-selection')) {
      console.log('📍 Step 4: User selection...');
      await page.waitForTimeout(3000);
      
      // Take screenshot
      await page.screenshot({ path: 'debug-step4-users.png' });
      
      // Get all user buttons
      const userButtons = await page.$$('button[class*="w-full p-6"]');
      console.log(`Found ${userButtons.length} user buttons`);
      
      if (userButtons.length > 0) {
        // Get user names
        for (let i = 0; i < userButtons.length; i++) {
          const userText = await userButtons[i].textContent();
          console.log(`User ${i + 1}: ${userText?.trim()}`);
        }
        
        // Look for "Trịnh Thị Bốn"
        let targetUserIndex = -1;
        for (let i = 0; i < userButtons.length; i++) {
          const userText = await userButtons[i].textContent();
          if (userText?.includes('Trịnh Thị Bốn')) {
            targetUserIndex = i;
            break;
          }
        }
        
        if (targetUserIndex >= 0) {
          console.log(`Selecting Trịnh Thị Bốn (index ${targetUserIndex})`);
          await userButtons[targetUserIndex].click();
        } else {
          console.log('Trịnh Thị Bốn not found, selecting first user');
          await userButtons[0].click();
        }
        
        await page.waitForTimeout(2000);
        console.log(`After user selection: ${page.url()}`);
      }
    }
    
    // Step 5: Password Entry
    if (page.url().includes('password')) {
      console.log('📍 Step 5: Password entry...');
      await page.waitForTimeout(2000);
      
      // Take screenshot
      await page.screenshot({ path: 'debug-step5-password.png' });
      
      // Get user info from URL
      const url = new URL(page.url());
      const email = url.searchParams.get('email');
      const name = url.searchParams.get('name');
      
      console.log(`Password page for: ${name} (${email})`);
      
      // Enter password
      await page.fill('input[type="password"]', '123456');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      console.log(`After password: ${page.url()}`);
      await page.screenshot({ path: 'debug-step5-after.png' });
    }
    
    // Step 6: Check final result
    console.log('📍 Step 6: Final check...');
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    console.log(`Final URL: ${finalUrl}`);
    
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ Successfully reached dashboard!');
      
      // Try to navigate to work page
      await page.goto('http://localhost:3002/dashboard/work');
      await page.waitForTimeout(5000);
      
      console.log(`Work page URL: ${page.url()}`);
      await page.screenshot({ path: 'debug-final-work.png' });
      
      // Check localStorage
      const localStorageData = await page.evaluate(() => {
        return {
          auth_user: localStorage.getItem('auth_user'),
          currentUserId: localStorage.getItem('currentUserId'),
          currentUserEmail: localStorage.getItem('currentUserEmail'),
          currentUserName: localStorage.getItem('currentUserName'),
          allKeys: Object.keys(localStorage)
        };
      });
      
      console.log('📊 LocalStorage data:', localStorageData);
      
    } else {
      console.log('❌ Failed to reach dashboard');
      await page.screenshot({ path: 'debug-failed.png' });
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    await page.screenshot({ path: 'debug-error.png' });
  } finally {
    console.log('🔍 Debug completed. Check screenshots for details.');
    await browser.close();
  }
}

debugAuthStepByStep().catch(console.error);
