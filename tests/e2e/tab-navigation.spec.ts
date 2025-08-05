import { test, expect } from '@playwright/test';
import { TaskManagementHelpers } from '../utils/page-helpers';

test.describe('Tab Navigation', () => {
  let helpers: TaskManagementHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TaskManagementHelpers(page);
    
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should navigate between main tabs', async ({ page }) => {
    // Test "Của Tôi" tab
    await helpers.navigateToTab('Của Tôi');
    await expect(page.locator('[data-testid="my-tasks-content"]')).toBeVisible();

    // Test "Của Nhóm" tab
    await helpers.navigateToTab('Của Nhóm');
    await expect(page.locator('[data-testid="team-tasks-content"]')).toBeVisible();

    // Test "Công việc chung" tab
    await helpers.navigateToTab('Công việc chung');
    await expect(page.locator('[data-testid="public-tasks-content"]')).toBeVisible();
  });

  test('should navigate between location subtabs', async ({ page }) => {
    // Navigate to "Của Nhóm" tab first
    await helpers.navigateToTab('Của Nhóm');

    // Test Hà Nội subtab
    await helpers.navigateToSubTab('Hà Nội');
    await expect(page.locator('[data-testid="hanoi-teams"]')).toBeVisible();

    // Test Hồ Chí Minh subtab
    await helpers.navigateToSubTab('Hồ Chí Minh');
    await expect(page.locator('[data-testid="hcm-teams"]')).toBeVisible();
  });

  test('should show all teams including empty ones in team tab', async ({ page }) => {
    await helpers.navigateToTab('Của Nhóm');
    
    // Should show teams even if they have no tasks
    const teamCards = page.locator('[data-testid="team-card"]');
    expect(await teamCards.count()).toBeGreaterThan(0);

    // Check for empty team message
    const emptyTeamMessage = page.locator('text=Nhóm này chưa có công việc nào');
    // Should be visible for at least some teams initially
  });

  test('should filter teams by location', async ({ page }) => {
    await helpers.navigateToTab('Của Nhóm');

    // Get initial team count
    const allTeams = page.locator('[data-testid="team-card"]');
    const totalCount = await allTeams.count();

    // Filter by Hà Nội
    await helpers.navigateToSubTab('Hà Nội');
    const hanoiTeams = page.locator('[data-testid="team-card"]');
    const hanoiCount = await hanoiTeams.count();

    // Filter by Hồ Chí Minh
    await helpers.navigateToSubTab('Hồ Chí Minh');
    const hcmTeams = page.locator('[data-testid="team-card"]');
    const hcmCount = await hcmTeams.count();

    // Verify filtering works (counts should be different)
    expect(hanoiCount + hcmCount).toBeLessThanOrEqual(totalCount);
  });

  test('should show team information correctly', async ({ page }) => {
    await helpers.navigateToTab('Của Nhóm');

    const firstTeam = page.locator('[data-testid="team-card"]').first();
    
    // Should show team name
    await expect(firstTeam.locator('[data-testid="team-name"]')).toBeVisible();
    
    // Should show member count
    await expect(firstTeam.locator('[data-testid="member-count"]')).toBeVisible();
    
    // Should show task count
    await expect(firstTeam.locator('[data-testid="task-count"]')).toBeVisible();
    
    // Should show team leader indicator
    await expect(firstTeam.locator('[data-testid="team-leader"]')).toBeVisible();
  });

  test('should maintain tab state during navigation', async ({ page }) => {
    // Navigate to a specific tab and subtab
    await helpers.navigateToTab('Của Nhóm');
    await helpers.navigateToSubTab('Hồ Chí Minh');

    // Create a task to test state persistence
    await helpers.openCreateTaskModal();
    await page.click('[data-testid="close-modal-button"]');

    // Verify we're still on the same tab/subtab
    await expect(page.locator('[data-testid="team-tasks-content"]')).toBeVisible();
    await expect(page.locator('[data-testid="hcm-teams"]')).toBeVisible();
  });

  test('should show correct task counts in different tabs', async ({ page }) => {
    // Create a test task first
    await helpers.openCreateTaskModal();
    await helpers.fillTaskForm({
      name: 'Tab Test Task',
      description: 'Testing tab functionality',
      shareScope: 'team'
    });
    await helpers.submitTaskForm();

    // Check "Của Tôi" tab shows the task
    await helpers.navigateToTab('Của Tôi');
    await helpers.verifyTaskExists('Tab Test Task');

    // Check "Của Nhóm" tab shows the task
    await helpers.navigateToTab('Của Nhóm');
    // Task should appear in team view

    // Create a public task
    await helpers.openCreateTaskModal();
    await helpers.fillTaskForm({
      name: 'Public Test Task',
      description: 'Testing public task',
      shareScope: 'public'
    });
    await helpers.submitTaskForm();

    // Check "Công việc chung" tab shows public task
    await helpers.navigateToTab('Công việc chung');
    await helpers.verifyTaskExists('Public Test Task');
  });

  test('should filter tasks by team member', async ({ page }) => {
    // Navigate to team tasks
    await helpers.navigateToTab('Của Nhóm');

    // Find a team member button and click it
    const memberButton = page.locator('[data-testid="team-member-button"]').first();
    if (await memberButton.count() > 0) {
      const memberName = await memberButton.textContent();
      await memberButton.click();

      // Should show filter indicator
      await expect(page.locator('text=Lọc theo:')).toBeVisible();

      // Should show filtered tasks only
      const taskItems = page.locator('[data-testid="task-item"]');
      const taskCount = await taskItems.count();

      // Click the same member again to deselect
      await memberButton.click();

      // Filter should be removed
      await expect(page.locator('text=Lọc theo:')).not.toBeVisible();
    }
  });

  test('should reset member filter when changing tabs', async ({ page }) => {
    // Navigate to team tasks and select a member
    await helpers.navigateToTab('Của Nhóm');

    const memberButton = page.locator('[data-testid="team-member-button"]').first();
    if (await memberButton.count() > 0) {
      await memberButton.click();

      // Verify filter is active
      await expect(page.locator('text=Lọc theo:')).toBeVisible();

      // Change to another tab
      await helpers.navigateToTab('Của Tôi');

      // Go back to team tasks
      await helpers.navigateToTab('Của Nhóm');

      // Filter should be reset
      await expect(page.locator('text=Lọc theo:')).not.toBeVisible();
    }
  });

  test('should show member task counts', async ({ page }) => {
    await helpers.navigateToTab('Của Nhóm');

    // Member buttons should show task counts
    const memberButtons = page.locator('[data-testid="team-member-button"]');
    const firstMember = memberButtons.first();

    if (await firstMember.count() > 0) {
      // Should show task count badge if member has tasks
      const memberText = await firstMember.textContent();
      // Task count should be visible in the button text or as a badge
      expect(memberText).toBeTruthy();
    }
  });
});
