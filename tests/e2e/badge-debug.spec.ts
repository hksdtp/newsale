import { expect, test } from '@playwright/test';

test.describe('Badge Debug Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept console logs để capture debug info
    page.on('console', msg => {
      if (
        msg.text().includes('🔍 mapDbTaskToTask') ||
        msg.text().includes('Normalized workTypes') ||
        msg.text().includes('Task updated successfully')
      ) {
        console.log(`[BROWSER LOG] ${msg.text()}`);
      }
    });

    // Try to go directly to dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Debug: Take screenshot để xem trang hiện tại
    await page.screenshot({ path: 'debug-page-state.png' });
    console.log('📸 Screenshot saved: debug-page-state.png');

    // Debug: Log page title và URL
    const title = await page.title();
    const url = page.url();
    console.log(`📄 Page title: ${title}`);
    console.log(`🔗 Page URL: ${url}`);

    // Debug: Check if we need to login
    const loginButton = page.locator('button:has-text("Đăng nhập")');
    const loginExists = (await loginButton.count()) > 0;
    console.log(`🔐 Login button exists: ${loginExists}`);

    if (loginExists) {
      console.log('🔐 Need to login first...');
      // Add login logic here if needed
    }

    // Check if we're on region selection page
    if (url.includes('/auth/region-selection')) {
      console.log('🌍 On region selection page, need to select region...');

      // Look for region buttons
      const regionButtons = page.locator('button');
      const buttonCount = await regionButtons.count();
      console.log(`🔘 Found ${buttonCount} buttons on region page`);

      // List all buttons to see what's available
      for (let i = 0; i < buttonCount; i++) {
        const button = regionButtons.nth(i);
        const buttonText = await button.textContent();
        console.log(`🔘 Button ${i}: ${buttonText}`);
      }

      // Try to find and click a region button (look for "Hà Nội" or similar)
      const hanoiButton = page.locator('button:has-text("Hà Nội")');
      const hcmButton = page.locator('button:has-text("Hồ Chí Minh")');

      if ((await hanoiButton.count()) > 0) {
        console.log('🔘 Clicking Hà Nội button');
        await hanoiButton.click();
      } else if ((await hcmButton.count()) > 0) {
        console.log('🔘 Clicking Hồ Chí Minh button');
        await hcmButton.click();
      } else {
        console.log('🔘 No region button found, trying first button');
        await regionButtons.first().click();
      }

      await page.waitForLoadState('networkidle');
      const newUrl = page.url();
      console.log(`🔗 New URL after region selection: ${newUrl}`);
    }
  });

  test('Debug page state', async ({ page }) => {
    console.log('🧪 Debugging page state...');

    // Check what elements exist on page
    const allElements = await page.locator('*').count();
    console.log(`📊 Total elements on page: ${allElements}`);

    // Check for common selectors
    const taskItems = await page.locator('[data-testid="task-item"]').count();
    const badges = await page.locator('[data-testid="work-type-badge"]').count();
    const buttons = await page.locator('button').count();
    const divs = await page.locator('div').count();

    console.log(`🏷️ Task items found: ${taskItems}`);
    console.log(`🏷️ Badges found: ${badges}`);
    console.log(`🔘 Buttons found: ${buttons}`);
    console.log(`📦 Divs found: ${divs}`);

    // Check page content
    const bodyText = await page.locator('body').textContent();
    console.log(`📝 Page contains "task": ${bodyText?.includes('task') || false}`);
    console.log(`📝 Page contains "công việc": ${bodyText?.includes('công việc') || false}`);
    console.log(`📝 Page contains "Đăng nhập": ${bodyText?.includes('Đăng nhập') || false}`);

    // Wait a bit and check again
    await page.waitForTimeout(3000);
    const taskItemsAfterWait = await page.locator('[data-testid="task-item"]').count();
    console.log(`🏷️ Task items after wait: ${taskItemsAfterWait}`);
  });

  test('Debug badge update issue', async ({ page }) => {
    console.log('🧪 Starting badge debug test...');

    // 1. Tìm task đầu tiên
    const firstTask = page.locator('[data-testid="task-item"]').first();
    await expect(firstTask).toBeVisible();

    // 2. Click vào task để mở detail
    await firstTask.click();
    await page.waitForSelector('[data-testid="task-detail-modal"]');

    // 3. Kiểm tra badge hiện tại
    const currentBadge = page.locator('[data-testid="work-type-badge"]');
    await expect(currentBadge).toBeVisible();

    const currentBadgeText = await currentBadge.textContent();
    console.log(`🏷️ Current badge: ${currentBadgeText}`);

    // 4. Click Edit button
    const editButton = page.locator('button:has-text("Chỉnh sửa")');
    await editButton.click();
    await page.waitForSelector('[data-testid="task-edit-form"]');

    // 5. Thay đổi work type
    const workTypeSelect = page.locator('select[name="workType"]');
    await expect(workTypeSelect).toBeVisible();

    const currentValue = await workTypeSelect.inputValue();
    console.log(`📝 Current workType value: ${currentValue}`);

    // Chọn work type khác
    const newWorkType = currentValue === 'sbg-new' ? 'partner-new' : 'sbg-new';
    await workTypeSelect.selectOption(newWorkType);
    console.log(`🔄 Changed to: ${newWorkType}`);

    // 6. Save changes
    const saveButton = page.locator('button:has-text("Lưu thay đổi")');
    await saveButton.click();

    // 7. Đợi modal đóng và kiểm tra badge mới
    await page.waitForSelector('[data-testid="task-detail-modal"]', { state: 'hidden' });

    // Đợi một chút để badge update
    await page.waitForTimeout(2000);

    // 8. Mở lại task detail để kiểm tra
    await firstTask.click();
    await page.waitForSelector('[data-testid="task-detail-modal"]');

    const updatedBadge = page.locator('[data-testid="work-type-badge"]');
    const updatedBadgeText = await updatedBadge.textContent();
    console.log(`🏷️ Updated badge: ${updatedBadgeText}`);

    // 9. Kiểm tra xem badge có thay đổi không
    if (updatedBadgeText === currentBadgeText) {
      console.log('❌ Badge KHÔNG thay đổi - có vấn đề!');
    } else {
      console.log('✅ Badge đã thay đổi thành công!');
    }

    // 10. Capture network requests để debug
    const responses: any[] = [];
    page.on('response', response => {
      if (response.url().includes('/api/tasks')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
        });
      }
    });

    // 11. Thử update lần nữa để capture network
    const editButton2 = page.locator('button:has-text("Chỉnh sửa")');
    await editButton2.click();
    await page.waitForSelector('[data-testid="task-edit-form"]');

    const workTypeSelect2 = page.locator('select[name="workType"]');
    const finalWorkType = newWorkType === 'sbg-new' ? 'kts-old' : 'sbg-new';
    await workTypeSelect2.selectOption(finalWorkType);

    const saveButton2 = page.locator('button:has-text("Lưu thay đổi")');
    await saveButton2.click();

    // Đợi response
    await page.waitForTimeout(3000);

    console.log('📡 Network responses:', responses);

    // 12. Kiểm tra final state
    await page.waitForSelector('[data-testid="task-detail-modal"]', { state: 'hidden' });
    await firstTask.click();
    await page.waitForSelector('[data-testid="task-detail-modal"]');

    const finalBadge = page.locator('[data-testid="work-type-badge"]');
    const finalBadgeText = await finalBadge.textContent();
    console.log(`🏷️ Final badge: ${finalBadgeText}`);

    // Đóng modal
    const closeButton = page.locator('[data-testid="close-modal"]');
    await closeButton.click();
  });

  test('Debug task list badge display', async ({ page }) => {
    console.log('🧪 Testing task list badge display...');

    // Đợi tasks load
    await page.waitForSelector('[data-testid="task-item"]');

    // Lấy tất cả badges trong task list
    const badges = page.locator('[data-testid="work-type-badge"]');
    const badgeCount = await badges.count();

    console.log(`🏷️ Found ${badgeCount} badges in task list`);

    // Kiểm tra từng badge
    for (let i = 0; i < Math.min(badgeCount, 5); i++) {
      const badge = badges.nth(i);
      const badgeText = await badge.textContent();
      console.log(`Badge ${i + 1}: ${badgeText}`);
    }

    // Kiểm tra xem có badge nào hiển thị "other" không
    const otherBadges = page.locator('[data-testid="work-type-badge"]:has-text("other")');
    const otherCount = await otherBadges.count();

    if (otherCount > 0) {
      console.log(`❌ Found ${otherCount} badges showing "other" - this indicates the bug!`);
    } else {
      console.log('✅ No "other" badges found - badges are working correctly');
    }
  });
});
