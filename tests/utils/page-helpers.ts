import { Page, expect } from '@playwright/test';

export class TaskManagementHelpers {
  constructor(private page: Page) {}

  // Navigation helpers
  async navigateToTab(tabName: 'Của Tôi' | 'Của Nhóm' | 'Công việc chung') {
    await this.page.click(`text=${tabName}`);
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSubTab(subTabName: 'Hà Nội' | 'Hồ Chí Minh') {
    await this.page.click(`text=${subTabName}`);
    await this.page.waitForLoadState('networkidle');
  }

  // Task creation helpers
  async openCreateTaskModal() {
    await this.page.click('[data-testid="create-task-button"]');
    await expect(this.page.locator('[data-testid="create-task-modal"]')).toBeVisible();
  }

  async fillTaskForm(taskData: {
    name: string;
    description: string;
    workTypes?: string[];
    priority?: string;
    status?: string;
    startDate?: string;
    dueDate?: string;
    shareScope?: string;
  }) {
    // Fill task name
    await this.page.fill('[data-testid="task-name-input"]', taskData.name);
    
    // Fill description
    await this.page.fill('[data-testid="task-description-input"]', taskData.description);

    // Select work types
    if (taskData.workTypes) {
      for (const workType of taskData.workTypes) {
        await this.page.click(`[data-testid="work-type-${workType}"]`);
      }
    }

    // Select priority
    if (taskData.priority) {
      await this.page.click('[data-testid="priority-dropdown"]');
      await this.page.click(`[data-testid="priority-${taskData.priority}"]`);
    }

    // Select status
    if (taskData.status) {
      await this.page.click('[data-testid="status-dropdown"]');
      await this.page.click(`[data-testid="status-${taskData.status}"]`);
    }

    // Set dates
    if (taskData.startDate) {
      await this.page.fill('[data-testid="start-date-input"]', taskData.startDate);
    }

    if (taskData.dueDate) {
      await this.page.fill('[data-testid="due-date-input"]', taskData.dueDate);
    }

    // Select share scope
    if (taskData.shareScope) {
      await this.page.click('[data-testid="share-scope-dropdown"]');
      await this.page.click(`[data-testid="share-scope-${taskData.shareScope}"]`);
    }
  }

  async submitTaskForm() {
    await this.page.click('[data-testid="submit-task-button"]');
    await expect(this.page.locator('[data-testid="create-task-modal"]')).not.toBeVisible();
  }

  // Task interaction helpers
  async clickTask(taskName: string) {
    await this.page.click(`[data-testid="task-item"]:has-text("${taskName}")`);
  }

  async openTaskDetail(taskName: string) {
    await this.clickTask(taskName);
    await expect(this.page.locator('[data-testid="task-detail-modal"]')).toBeVisible();
  }

  async editTaskFromDetail() {
    await this.page.click('[data-testid="edit-task-button"]');
    await expect(this.page.locator('[data-testid="edit-task-modal"]')).toBeVisible();
  }

  async deleteTaskFromDetail() {
    await this.page.click('[data-testid="delete-task-button"]');
    await expect(this.page.locator('[data-testid="delete-confirm-modal"]')).toBeVisible();
  }

  async confirmDelete() {
    await this.page.click('[data-testid="confirm-delete-button"]');
  }

  // Filter and search helpers
  async searchTasks(searchTerm: string) {
    await this.page.fill('[data-testid="search-input"]', searchTerm);
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status: string) {
    await this.page.click('[data-testid="status-filter"]');
    await this.page.click(`[data-testid="filter-status-${status}"]`);
  }

  async filterByPriority(priority: string) {
    await this.page.click('[data-testid="priority-filter"]');
    await this.page.click(`[data-testid="filter-priority-${priority}"]`);
  }

  // Verification helpers
  async verifyTaskExists(taskName: string) {
    await expect(this.page.locator(`[data-testid="task-item"]:has-text("${taskName}")`)).toBeVisible();
  }

  async verifyTaskNotExists(taskName: string) {
    await expect(this.page.locator(`[data-testid="task-item"]:has-text("${taskName}")`)).not.toBeVisible();
  }

  async verifyTaskCount(expectedCount: number) {
    const taskItems = this.page.locator('[data-testid="task-item"]');
    await expect(taskItems).toHaveCount(expectedCount);
  }

  // DatePicker helpers
  async openDatePicker(fieldTestId: string) {
    await this.page.click(`[data-testid="${fieldTestId}"]`);
    await expect(this.page.locator('[data-testid="date-picker-calendar"]')).toBeVisible();
  }

  async selectDate(day: number) {
    await this.page.click(`[data-testid="calendar-day-${day}"]`);
  }

  async selectToday() {
    await this.page.click('[data-testid="quick-today-button"]');
  }

  async selectTomorrow() {
    await this.page.click('[data-testid="quick-tomorrow-button"]');
  }

  // Dropdown helpers
  async openDropdown(dropdownTestId: string) {
    await this.page.click(`[data-testid="${dropdownTestId}"]`);
    await expect(this.page.locator('[data-testid="dropdown-menu"]')).toBeVisible();
  }

  async selectDropdownOption(optionTestId: string) {
    await this.page.click(`[data-testid="${optionTestId}"]`);
  }
}
