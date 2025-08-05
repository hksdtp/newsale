import { schedulingService } from './schedulingService';

/**
 * Background job service for handling scheduled tasks
 * This service automatically moves scheduled tasks to the current day
 */
class ScheduledTasksJobService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private readonly CHECK_INTERVAL = 60 * 1000; // Check every minute
  private readonly DAILY_CHECK_HOUR = 0; // Run daily check at midnight
  private lastDailyCheck: string | null = null;

  /**
   * Start the background job
   */
  start(): void {
    if (this.isRunning) {
      console.log('Scheduled tasks job is already running');
      return;
    }

    console.log('Starting scheduled tasks background job...');
    this.isRunning = true;

    // Run initial check
    this.runDailyCheck();

    // Set up interval to check periodically
    this.intervalId = setInterval(() => {
      this.checkAndRunDailyJob();
    }, this.CHECK_INTERVAL);

    console.log(`Scheduled tasks job started. Checking every ${this.CHECK_INTERVAL / 1000} seconds.`);
  }

  /**
   * Stop the background job
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('Scheduled tasks job is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('Scheduled tasks background job stopped');
  }

  /**
   * Check if we need to run the daily job
   */
  private checkAndRunDailyJob(): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    // Run daily check at midnight or if we haven't run today yet
    if (
      (currentHour === this.DAILY_CHECK_HOUR && this.lastDailyCheck !== today) ||
      this.lastDailyCheck === null
    ) {
      this.runDailyCheck();
    }
  }

  /**
   * Run the daily check to move scheduled tasks
   */
  private async runDailyCheck(): Promise<void> {
    try {
      console.log('Running daily scheduled tasks check...');

      // Temporarily disabled until database migration is complete
      console.log('⚠️  Scheduled tasks feature temporarily disabled - database migration pending');

      // Update last check date
      this.lastDailyCheck = new Date().toISOString().split('T')[0];

    } catch (error) {
      console.error('Error in daily scheduled tasks check:', error);
    }
  }

  /**
   * Notify about moved tasks (could be extended to show notifications)
   */
  private notifyTasksMoved(tasks: any[]): void {
    // This could be extended to show browser notifications
    // or update a notification center in the app
    
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Công việc đã lên lịch', {
        body: `${tasks.length} công việc đã được thêm vào danh sách hôm nay`,
        icon: '/favicon.ico'
      });
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Manual trigger for testing
   */
  async triggerManualCheck(): Promise<void> {
    console.log('Manually triggering scheduled tasks check...');
    await this.runDailyCheck();
  }

  /**
   * Get job status
   */
  getStatus(): { isRunning: boolean; lastCheck: string | null; nextCheck: string } {
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setDate(nextMidnight.getDate() + 1);
    nextMidnight.setHours(0, 0, 0, 0);

    return {
      isRunning: this.isRunning,
      lastCheck: this.lastDailyCheck,
      nextCheck: nextMidnight.toISOString()
    };
  }

  /**
   * Initialize the service when the app starts
   */
  static initialize(): ScheduledTasksJobService {
    const service = new ScheduledTasksJobService();
    
    // Request notification permission
    service.requestNotificationPermission();
    
    // Start the job
    service.start();
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // Page became visible, check if we need to run daily check
        service.checkAndRunDailyJob();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      service.stop();
    });

    return service;
  }
}

// Create singleton instance
export const scheduledTasksJob = ScheduledTasksJobService.initialize();

// Export the class for testing
export { ScheduledTasksJobService };
