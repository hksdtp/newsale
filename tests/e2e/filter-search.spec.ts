import { test, expect } from '@playwright/test';
import { TaskManagementHelpers } from '../utils/page-helpers';

test.describe('Filter and Search Functionality', () => {
  let helpers: TaskManagementHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TaskManagementHelpers(page);
    
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Create multiple test tasks with different properties
    const testTasks = [
      {
        name: 'High Priority Task',
        description: 'Urgent task that needs immediate attention',
        priority: 'high',
        status: 'new-requests',
        workTypes: ['sbg-new']
      },
      {
        name: 'Normal Priority Task',
        description: 'Regular task for daily work',
        priority: 'normal',
        status: 'approved',
        workTypes: ['partner-old']
      },
      {
        name: 'Low Priority Task',
        description: 'Task that can wait',
        priority: 'low',
        status: 'live',
        workTypes: ['kts-new']
      },
      {
        name: 'Marketing Campaign',
        description: 'Create marketing materials for new product',
        priority: 'high',
        status: 'approved',
        workTypes: ['customer-new']
      }
    ];

    for (const task of testTasks) {
      await helpers.openCreateTaskModal();
      await helpers.fillTaskForm(task);
      await helpers.submitTaskForm();
    }
  });

  test('should search tasks by name', async ({ page }) => {
    // Search for specific task
    await helpers.searchTasks('High Priority');
    
    // Should show only matching tasks
    await helpers.verifyTaskExists('High Priority Task');
    await helpers.verifyTaskNotExists('Normal Priority Task');
    await helpers.verifyTaskNotExists('Low Priority Task');
  });

  test('should search tasks by description content', async ({ page }) => {
    // Search by description keyword
    await helpers.searchTasks('marketing');
    
    // Should find task with matching description
    await helpers.verifyTaskExists('Marketing Campaign');
    await helpers.verifyTaskNotExists('High Priority Task');
  });

  test('should filter tasks by status', async ({ page }) => {
    // Filter by "Đang tiến hành" status
    await helpers.filterByStatus('approved');
    
    // Should show only approved tasks
    await helpers.verifyTaskExists('Normal Priority Task');
    await helpers.verifyTaskExists('Marketing Campaign');
    await helpers.verifyTaskNotExists('High Priority Task');
    await helpers.verifyTaskNotExists('Low Priority Task');
  });

  test('should filter tasks by priority', async ({ page }) => {
    // Filter by high priority
    await helpers.filterByPriority('high');
    
    // Should show only high priority tasks
    await helpers.verifyTaskExists('High Priority Task');
    await helpers.verifyTaskExists('Marketing Campaign');
    await helpers.verifyTaskNotExists('Normal Priority Task');
    await helpers.verifyTaskNotExists('Low Priority Task');
  });

  test('should combine search and filters', async ({ page }) => {
    // Search for "Task" and filter by high priority
    await helpers.searchTasks('Task');
    await helpers.filterByPriority('high');
    
    // Should show only high priority tasks with "Task" in name
    await helpers.verifyTaskExists('High Priority Task');
    await helpers.verifyTaskNotExists('Marketing Campaign'); // Has high priority but no "Task" in name
    await helpers.verifyTaskNotExists('Normal Priority Task');
  });

  test('should clear search results', async ({ page }) => {
    // Search for something
    await helpers.searchTasks('High Priority');
    await helpers.verifyTaskCount(1);
    
    // Clear search
    await page.fill('[data-testid="search-input"]', '');
    await page.waitForLoadState('networkidle');
    
    // Should show all tasks again
    await helpers.verifyTaskCount(4);
  });

  test('should clear filters', async ({ page }) => {
    // Apply a filter
    await helpers.filterByPriority('high');
    await helpers.verifyTaskCount(2);
    
    // Clear filter
    await page.click('[data-testid="clear-filters-button"]');
    await page.waitForLoadState('networkidle');
    
    // Should show all tasks again
    await helpers.verifyTaskCount(4);
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    // Search for something that doesn't exist
    await helpers.searchTasks('NonExistentTask');
    
    // Should show no results message
    await expect(page.locator('[data-testid="no-results-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="no-results-message"]')).toContainText('Không tìm thấy công việc nào');
  });

  test('should maintain filters when switching tabs', async ({ page }) => {
    // Apply a filter
    await helpers.filterByPriority('high');
    
    // Switch to another tab
    await helpers.navigateToTab('Của Nhóm');
    
    // Switch back
    await helpers.navigateToTab('Của Tôi');
    
    // Filter should still be applied
    await helpers.verifyTaskCount(2);
  });

  test('should filter by work type', async ({ page }) => {
    // Filter by specific work type
    await page.click('[data-testid="work-type-filter"]');
    await page.click('[data-testid="filter-work-type-sbg-new"]');
    
    // Should show only tasks with that work type
    await helpers.verifyTaskExists('High Priority Task');
    await helpers.verifyTaskNotExists('Normal Priority Task');
  });

  test('should show filter indicators', async ({ page }) => {
    // Apply multiple filters
    await helpers.filterByPriority('high');
    await helpers.filterByStatus('approved');
    
    // Should show active filter indicators
    await expect(page.locator('[data-testid="active-filter-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-filter-status"]')).toBeVisible();
    
    // Should show filter count
    await expect(page.locator('[data-testid="filter-count"]')).toContainText('2');
  });

  test('should handle real-time search', async ({ page }) => {
    const searchInput = page.locator('[data-testid="search-input"]');
    
    // Type gradually and verify results update
    await searchInput.fill('H');
    await page.waitForTimeout(300); // Debounce
    await helpers.verifyTaskExists('High Priority Task');
    
    await searchInput.fill('High');
    await page.waitForTimeout(300);
    await helpers.verifyTaskExists('High Priority Task');
    await helpers.verifyTaskNotExists('Normal Priority Task');
  });

  test('should sort tasks by different criteria', async ({ page }) => {
    // Sort by priority (high to low)
    await page.click('[data-testid="sort-dropdown"]');
    await page.click('[data-testid="sort-priority-desc"]');
    
    // Verify order
    const taskItems = page.locator('[data-testid="task-item"]');
    await expect(taskItems.first()).toContainText('High Priority Task');
    
    // Sort by name (A to Z)
    await page.click('[data-testid="sort-dropdown"]');
    await page.click('[data-testid="sort-name-asc"]');
    
    // Verify alphabetical order
    await expect(taskItems.first()).toContainText('High Priority Task'); // "H" comes first
  });
});
