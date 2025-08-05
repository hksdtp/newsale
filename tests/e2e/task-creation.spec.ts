import { test, expect } from '@playwright/test';
import { TaskManagementHelpers } from '../utils/page-helpers';

test.describe('Task Creation', () => {
  let helpers: TaskManagementHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new TaskManagementHelpers(page);
    
    // Clear localStorage before each test
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should create a new task with WorkTypeDropdown, DatePicker and Dropdown', async ({ page }) => {
    // Open create task modal
    await helpers.openCreateTaskModal();

    // Fill task name and description
    await page.fill('[data-testid="task-name-input"]', 'E2E Test Task');
    await page.fill('[data-testid="task-description-input"]', 'This task was created by automated test');

    // Test WorkTypeDropdown functionality
    await page.click('[data-testid="work-type-dropdown"]');
    await expect(page.locator('text=Tìm kiếm loại công việc...')).toBeVisible();

    // Select multiple work types
    await page.click('text=SBG mới');
    await page.click('text=Đối tác mới');

    // Close dropdown by clicking outside
    await page.click('[data-testid="task-name-input"]');

    // Test DatePicker functionality
    await helpers.openDatePicker('start-date-input');
    await helpers.selectToday();

    // Test Priority Dropdown functionality
    await helpers.openDropdown('priority-dropdown');
    await helpers.selectDropdownOption('priority-high');

    // Submit the form
    await helpers.submitTaskForm();

    // Verify task was created
    await helpers.verifyTaskExists('E2E Test Task');
  });

  test('should create task with multiple work types', async ({ page }) => {
    await helpers.openCreateTaskModal();

    const taskData = {
      name: 'Multi Work Type Task',
      description: 'Task with multiple work types selected',
      workTypes: ['sbg-new', 'partner-old', 'kts-new'],
      priority: 'normal'
    };

    await helpers.fillTaskForm(taskData);
    await helpers.submitTaskForm();

    // Verify task shows all work type badges
    const taskElement = page.locator('[data-testid="task-item"]:has-text("Multi Work Type Task")');
    await expect(taskElement.locator('[data-testid="work-type-badge"]')).toHaveCount(3);
  });

  test('should validate required fields', async ({ page }) => {
    await helpers.openCreateTaskModal();

    // Try to submit without filling required fields
    await page.click('[data-testid="submit-task-button"]');

    // Should show validation errors
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    
    // Modal should still be open
    await expect(page.locator('[data-testid="create-task-modal"]')).toBeVisible();
  });

  test('should use DatePicker quick actions', async ({ page }) => {
    await helpers.openCreateTaskModal();

    // Test "Today" quick action
    await helpers.openDatePicker('start-date-input');
    await helpers.selectToday();
    
    const todayDate = new Date().toISOString().split('T')[0];
    await expect(page.locator('[data-testid="start-date-input"]')).toHaveValue(todayDate);

    // Test "Tomorrow" quick action for due date
    await helpers.openDatePicker('due-date-input');
    await helpers.selectTomorrow();
    
    const tomorrowDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await expect(page.locator('[data-testid="due-date-input"]')).toHaveValue(tomorrowDate);
  });

  test('should test all dropdown options', async ({ page }) => {
    await helpers.openCreateTaskModal();

    // Test Status dropdown
    const statusOptions = ['new-requests', 'approved', 'live'];
    for (const status of statusOptions) {
      await helpers.openDropdown('status-dropdown');
      await helpers.selectDropdownOption(`status-${status}`);
      
      // Verify selection
      await expect(page.locator('[data-testid="status-dropdown"]')).toContainText(status);
    }

    // Test Priority dropdown
    const priorityOptions = ['low', 'normal', 'high'];
    for (const priority of priorityOptions) {
      await helpers.openDropdown('priority-dropdown');
      await helpers.selectDropdownOption(`priority-${priority}`);
      
      // Verify selection
      await expect(page.locator('[data-testid="priority-dropdown"]')).toContainText(priority);
    }

    // Test Share Scope dropdown
    const shareScopeOptions = ['team', 'private', 'public'];
    for (const scope of shareScopeOptions) {
      await helpers.openDropdown('share-scope-dropdown');
      await helpers.selectDropdownOption(`share-scope-${scope}`);
      
      // Verify selection
      await expect(page.locator('[data-testid="share-scope-dropdown"]')).toContainText(scope);
    }
  });

  test('should handle form reset after submission', async ({ page }) => {
    await helpers.openCreateTaskModal();

    const taskData = {
      name: 'Reset Test Task',
      description: 'Testing form reset functionality',
      workTypes: ['other'],
      priority: 'low'
    };

    await helpers.fillTaskForm(taskData);
    await helpers.submitTaskForm();

    // Open modal again and verify form is reset
    await helpers.openCreateTaskModal();

    await expect(page.locator('[data-testid="task-name-input"]')).toHaveValue('');
    await expect(page.locator('[data-testid="task-description-input"]')).toHaveValue('');
  });

  test('should test WorkTypeDropdown search functionality', async ({ page }) => {
    await helpers.openCreateTaskModal();

    // Open work type dropdown
    await page.click('[data-testid="work-type-dropdown"]');

    // Test search functionality
    const searchInput = page.locator('input[placeholder="Tìm kiếm loại công việc..."]');
    await searchInput.fill('SBG');

    // Should show only SBG options
    await expect(page.locator('text=SBG mới')).toBeVisible();
    await expect(page.locator('text=SBG cũ')).toBeVisible();
    await expect(page.locator('text=Đối tác mới')).not.toBeVisible();

    // Clear search
    await searchInput.clear();

    // Should show all options again
    await expect(page.locator('text=Đối tác mới')).toBeVisible();
  });

  test('should test WorkTypeDropdown category organization', async ({ page }) => {
    await helpers.openCreateTaskModal();

    // Open work type dropdown
    await page.click('[data-testid="work-type-dropdown"]');

    // Should show category headers
    await expect(page.locator('text=SBG')).toBeVisible();
    await expect(page.locator('text=ĐỐI TÁC')).toBeVisible();
    await expect(page.locator('text=KTS')).toBeVisible();
    await expect(page.locator('text=KHÁCH HÀNG')).toBeVisible();
    await expect(page.locator('text=KHÁC')).toBeVisible();
  });

  test('should test WorkTypeDropdown multiple selection and removal', async ({ page }) => {
    await helpers.openCreateTaskModal();

    // Open work type dropdown
    await page.click('[data-testid="work-type-dropdown"]');

    // Select multiple options
    await page.click('text=SBG mới');
    await page.click('text=Đối tác cũ');
    await page.click('text=KTS mới');

    // Close dropdown
    await page.click('[data-testid="task-name-input"]');

    // Should show selected badges
    await expect(page.locator('text=SBG mới')).toBeVisible();
    await expect(page.locator('text=Đối tác cũ')).toBeVisible();
    await expect(page.locator('text=KTS mới')).toBeVisible();

    // Remove one selection using the X button on badge
    await page.locator('[data-testid="work-type-dropdown"] button:has-text("×")').first().click();

    // Should have one less selection
    const badges = page.locator('[data-testid="work-type-dropdown"] span:has-text("mới")');
    await expect(badges).toHaveCount(2);
  });
});
