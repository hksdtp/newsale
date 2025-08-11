import { test, expect } from '@playwright/test';

test.describe('SPA Routing', () => {
  test('should handle page refresh without 404', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
    
    // Should redirect to region selection
    await expect(page).toHaveURL(/\/auth\/region-selection/);
    
    // Navigate to a different route
    await page.goto('/auth/director-login');
    await expect(page).toHaveURL(/\/auth\/director-login/);
    
    // Refresh the page - this should NOT result in 404
    await page.reload();
    
    // Should still be on the same page
    await expect(page).toHaveURL(/\/auth\/director-login/);
    
    // Should not show 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
  });

  test('should handle direct URL access', async ({ page }) => {
    // Directly access a deep route
    await page.goto('/dashboard');
    
    // Should not get 404 error
    await expect(page.locator('text=404')).not.toBeVisible();
    
    // Should either show the dashboard or redirect to auth
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|auth)/);
  });

  test('should handle unknown routes with 404 page', async ({ page }) => {
    // Navigate to unknown route
    await page.goto('/unknown-route-that-does-not-exist');
    
    // Should show custom 404 page
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Trang không tìm thấy')).toBeVisible();
    
    // Should have link back to region selection
    const backLink = page.locator('text=Về trang chọn khu vực');
    await expect(backLink).toBeVisible();
    
    // Click back link should work
    await backLink.click();
    await expect(page).toHaveURL(/\/auth\/region-selection/);
  });

  test('should handle nested routes correctly', async ({ page }) => {
    // Test dashboard with tab parameter
    await page.goto('/dashboard/work');
    
    // Should not get 404
    await expect(page.locator('text=404')).not.toBeVisible();
    
    // Refresh should work
    await page.reload();
    await expect(page.locator('text=404')).not.toBeVisible();
  });
});
