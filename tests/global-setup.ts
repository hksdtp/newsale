import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Clear localStorage before tests
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto('http://localhost:3003');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    console.log('✅ Cleared browser storage');
  } catch (error) {
    console.log('⚠️  Could not clear storage, server might not be running yet');
  }
  
  await browser.close();
  console.log('✅ Global setup completed');
}

export default globalSetup;
