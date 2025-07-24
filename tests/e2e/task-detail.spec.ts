import { test, expect } from '@playwright/test';
import { TaskManagementHelpers } from '../utils/page-helpers';

test.describe('Task Detail Modal', () => {
  let helpers: TaskManagementHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TaskManagementHelpers(page);
    
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create a test task for detail testing
    await helpers.openCreateTaskModal();
    await helpers.fillTaskForm({
      name: 'Detail Test Task',
      description: 'This task is for testing detail modal functionality',
      workTypes: ['sbg-new', 'partner-old'],
      priority: 'high',
      status: 'approved',
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shareScope: 'team'
    });
    await helpers.submitTaskForm();
  });

  test('should open task detail modal when clicking on task', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Verify modal is open and shows correct information
    await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-detail-title"]')).toContainText('Detail Test Task');
    await expect(page.locator('[data-testid="task-detail-description"]')).toContainText('This task is for testing detail modal functionality');
  });

  test('should display work type badges correctly', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Should show multiple work type badges
    const workTypeBadges = page.locator('[data-testid="work-type-badge"]');
    await expect(workTypeBadges).toHaveCount(2);
    
    // Should show correct work types
    await expect(page.locator('[data-testid="work-type-badge"]:has-text("SBG mới")')).toBeVisible();
    await expect(page.locator('[data-testid="work-type-badge"]:has-text("Đối tác cũ")')).toBeVisible();
  });

  test('should show task status and priority', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Should display status
    await expect(page.locator('[data-testid="task-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-status"]')).toContainText('Đang tiến hành');
    
    // Should display priority
    await expect(page.locator('[data-testid="task-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-priority"]')).toContainText('Cao');
  });

  test('should show date information', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Should show start date
    await expect(page.locator('[data-testid="task-start-date"]')).toBeVisible();
    
    // Should show due date
    await expect(page.locator('[data-testid="task-due-date"]')).toBeVisible();
  });

  test('should show people information', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Should show creator
    await expect(page.locator('[data-testid="task-creator"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-creator"]')).toContainText('Current User');
    
    // Should show assigned person (or "Chưa phân công")
    await expect(page.locator('[data-testid="task-assignee"]')).toBeVisible();
  });

  test('should have edit and delete buttons', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Should show edit button
    await expect(page.locator('[data-testid="edit-task-button"]')).toBeVisible();
    
    // Should show delete button
    await expect(page.locator('[data-testid="delete-task-button"]')).toBeVisible();
    
    // Should show close button
    await expect(page.locator('[data-testid="close-detail-button"]')).toBeVisible();
  });

  test('should open edit modal from detail modal', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    await helpers.editTaskFromDetail();
    
    // Edit modal should be open
    await expect(page.locator('[data-testid="edit-task-modal"]')).toBeVisible();
    
    // Detail modal should be closed
    await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();
    
    // Form should be pre-filled with current task data
    await expect(page.locator('[data-testid="task-name-input"]')).toHaveValue('Detail Test Task');
  });

  test('should open delete confirmation from detail modal', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    await helpers.deleteTaskFromDetail();
    
    // Delete confirmation modal should be open
    await expect(page.locator('[data-testid="delete-confirm-modal"]')).toBeVisible();
    
    // Should show task name in confirmation
    await expect(page.locator('[data-testid="delete-confirm-modal"]')).toContainText('Detail Test Task');
  });

  test('should delete task successfully', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    await helpers.deleteTaskFromDetail();
    await helpers.confirmDelete();
    
    // Task should be removed from the list
    await helpers.verifyTaskNotExists('Detail Test Task');
    
    // Modals should be closed
    await expect(page.locator('[data-testid="delete-confirm-modal"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();
  });

  test('should close detail modal with close button', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Click close button
    await page.click('[data-testid="close-detail-button"]');
    
    // Modal should be closed
    await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();
  });

  test('should close detail modal with escape key', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Press escape key
    await page.keyboard.press('Escape');
    
    // Modal should be closed
    await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();
  });

  test('should close detail modal by clicking outside', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Click outside the modal (on backdrop)
    await page.click('[data-testid="modal-backdrop"]');
    
    // Modal should be closed
    await expect(page.locator('[data-testid="task-detail-modal"]')).not.toBeVisible();
  });

  test('should show additional task information', async ({ page }) => {
    await helpers.openTaskDetail('Detail Test Task');
    
    // Should show department
    await expect(page.locator('[data-testid="task-department"]')).toBeVisible();
    
    // Should show task ID
    await expect(page.locator('[data-testid="task-id"]')).toBeVisible();
    
    // Should show creation time
    await expect(page.locator('[data-testid="task-created-at"]')).toBeVisible();
  });
});
