#!/usr/bin/env node

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureScreenshots() {
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, '../screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1200, height: 800 },
  });
  const page = await context.newPage();

  console.log('🚀 Starting screenshot capture...');

  try {
    // 1. Login Page
    console.log('📸 Capturing Login Page...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(screenshotsDir, 'login-page.png'),
      fullPage: true,
    });

    // 2. Navigate to password page directly
    console.log('📸 Capturing Password Page...');
    await page.goto('http://localhost:5173/auth/password?email=test@example.com&name=Test User');
    await page.waitForLoadState('networkidle');
    await page.screenshot({
      path: path.join(screenshotsDir, 'password-page.png'),
      fullPage: true,
    });

    // 3. Director Login Page (if accessible)
    console.log('📸 Attempting to capture Director Login Page...');
    try {
      await page.goto('http://localhost:5173/auth/director-login');
      await page.waitForLoadState('networkidle');
      await page.screenshot({
        path: path.join(screenshotsDir, 'director-login-page.png'),
        fullPage: true,
      });
    } catch (error) {
      console.log('⚠️  Director login page not accessible');
    }

    console.log('✅ Screenshots captured successfully!');
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
  } catch (error) {
    console.error('❌ Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

module.exports = captureScreenshots;
