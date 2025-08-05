import { supabase } from '../shared/api/supabase';
import { getCurrentUser } from '../data/usersMockData';
import { Task } from '../data/dashboardMockData';

export interface ScheduleTaskData {
  taskId: string;
  scheduledDate: string; // ISO date string
  scheduledTime?: string; // HH:MM format
}

export interface ScheduledTask extends Task {
  scheduled_date: string;
  scheduled_time?: string;
  source: 'manual' | 'scheduled' | 'recurring';
}

export interface SchedulingResult {
  success: boolean;
  task?: ScheduledTask;
  error?: string;
}

class SchedulingService {
  // Schedule a task for a specific date/time
  async scheduleTask(data: ScheduleTaskData): Promise<SchedulingResult> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Validate date
      const scheduledDate = new Date(data.scheduledDate);
      if (isNaN(scheduledDate.getTime())) {
        return { success: false, error: 'Invalid scheduled date' };
      }

      // Check if date is in the future
      const now = new Date();
      if (scheduledDate < now) {
        return { success: false, error: 'Scheduled date must be in the future' };
      }

      // Validate time format if provided
      if (data.scheduledTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.scheduledTime)) {
        return { success: false, error: 'Invalid time format. Use HH:MM' };
      }

      // Check if user has access to the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', data.taskId)
        .single();

      if (taskError || !task) {
        return { success: false, error: 'Task not found' };
      }

      // Temporarily disable authorization check for testing
      // TODO: Re-enable when user system is properly set up
      // if (task.created_by !== currentUser.id && task.assigned_to !== currentUser.id) {
      //   return { success: false, error: 'Not authorized to schedule this task' };
      // }

      // Update task with scheduling information
      const updateData: any = {
        scheduled_date: data.scheduledDate,
        source: 'manual' // Will be changed to 'scheduled' when moved
      };

      if (data.scheduledTime) {
        updateData.scheduled_time = data.scheduledTime;
      }

      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', data.taskId)
        .select()
        .single();

      if (updateError) {
        console.error('Error scheduling task:', updateError);
        return { success: false, error: 'Failed to schedule task' };
      }

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Schedule task error:', error);
      return { success: false, error: 'Unexpected error during scheduling' };
    }
  }

  // Remove scheduling from a task
  async unscheduleTask(taskId: string): Promise<SchedulingResult> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if user has access to the task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        return { success: false, error: 'Task not found' };
      }

      if (task.created_by_id !== currentUser.id && task.assigned_to_id !== currentUser.id) {
        return { success: false, error: 'Not authorized to modify this task' };
      }

      // Remove scheduling information
      const { data: updatedTask, error: updateError } = await supabase
        .from('tasks')
        .update({
          scheduled_date: null,
          scheduled_time: null,
          source: 'manual'
        })
        .eq('id', taskId)
        .select()
        .single();

      if (updateError) {
        console.error('Error unscheduling task:', updateError);
        return { success: false, error: 'Failed to unschedule task' };
      }

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Unschedule task error:', error);
      return { success: false, error: 'Unexpected error during unscheduling' };
    }
  }

  // Get scheduled tasks for a specific date
  async getScheduledTasks(date: string, userId?: string): Promise<ScheduledTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check permissions for viewing other users
      const canViewAllSchedules = currentUser.name === 'Khổng Đức Mạnh' || currentUser.email === 'manh.khong@company.com';
      const targetUserId = userId || currentUser.id;

      if (!canViewAllSchedules && targetUserId !== currentUser.id) {
        throw new Error('Permission denied: Cannot view other users schedules');
      }

      const targetDate = new Date(date).toISOString().split('T')[0];

      console.log('🔍 Getting scheduled tasks for date:', {
        targetDate,
        userId: targetUserId,
        requestedBy: currentUser.id,
        isAdmin: canViewAllSchedules
      });

      let query = supabase
        .from('tasks')
        .select('*')
        .not('scheduled_date', 'is', null)
        .eq('scheduled_date', targetDate);

      // Filter by user if specified or if not admin
      if (userId) {
        query = query.or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`);
      } else if (!canViewAllSchedules) {
        query = query.or(`created_by_id.eq.${currentUser.id},assigned_to_id.eq.${currentUser.id}`);
      }

      const { data, error } = await query.order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching scheduled tasks:', error);
        throw new Error('Failed to fetch scheduled tasks');
      }

      return data || [];
    } catch (error) {
      console.error('Get scheduled tasks error:', error);
      throw error;
    }
  }

  // Get all scheduled tasks for current user
  async getMyScheduledTasks(): Promise<ScheduledTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .not('scheduled_date', 'is', null)
        .or(`created_by_id.eq.${currentUser.id},assigned_to_id.eq.${currentUser.id}`)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching my scheduled tasks:', error);
        throw new Error('Failed to fetch scheduled tasks');
      }

      return data || [];
    } catch (error) {
      console.error('Get my scheduled tasks error:', error);
      throw error;
    }
  }

  // Move scheduled tasks to current day (called by background job)
  async moveScheduledTasksToToday(): Promise<{ movedCount: number; tasks: ScheduledTask[] }> {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get tasks scheduled for today that haven't been moved yet
      const { data: tasksToMove, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('scheduled_date', today)
        .eq('source', 'manual')
        .not('scheduled_date', 'is', null);

      if (fetchError) {
        console.error('Error fetching tasks to move:', fetchError);
        throw new Error('Failed to fetch tasks to move');
      }

      if (!tasksToMove || tasksToMove.length === 0) {
        return { movedCount: 0, tasks: [] };
      }

      // Update source to 'scheduled' for these tasks
      const taskIds = tasksToMove.map(task => task.id);
      const { data: movedTasks, error: updateError } = await supabase
        .from('tasks')
        .update({ source: 'scheduled' })
        .in('id', taskIds)
        .select();

      if (updateError) {
        console.error('Error moving scheduled tasks:', updateError);
        throw new Error('Failed to move scheduled tasks');
      }

      return { movedCount: movedTasks?.length || 0, tasks: movedTasks || [] };
    } catch (error) {
      console.error('Move scheduled tasks error:', error);
      throw error;
    }
  }

  // Check if a task is scheduled
  isTaskScheduled(task: any): boolean {
    return task.scheduled_date !== null && task.scheduled_date !== undefined;
  }

  // Check if a task was moved from schedule
  isTaskFromSchedule(task: any): boolean {
    return task.source === 'scheduled';
  }

  // Format scheduled date for display
  formatScheduledDate(scheduledDate: string, scheduledTime?: string): string {
    const date = new Date(scheduledDate);
    const dateStr = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (scheduledTime) {
      return `${dateStr} lúc ${scheduledTime}`;
    }

    return dateStr;
  }

  // Get upcoming scheduled tasks (next 7 days)
  async getUpcomingScheduledTasks(): Promise<ScheduledTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .not('scheduled_date', 'is', null)
        .gte('scheduled_date', today.toISOString().split('T')[0])
        .lte('scheduled_date', nextWeek.toISOString().split('T')[0])
        .or(`created_by.eq.${currentUser.id},assigned_to.eq.${currentUser.id}`)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching upcoming scheduled tasks:', error);
        throw new Error('Failed to fetch upcoming scheduled tasks');
      }

      return data || [];
    } catch (error) {
      console.error('Get upcoming scheduled tasks error:', error);
      throw error;
    }
  }

  // Get scheduled tasks by specific user
  async getScheduledTasksByUser(userId: string): Promise<ScheduledTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check if current user can view all schedules (admin permission)
      const canViewAllSchedules = currentUser.name === 'Khổng Đức Mạnh' || currentUser.email === 'manh.khong@company.com';
      if (!canViewAllSchedules && userId !== currentUser.id) {
        throw new Error('Permission denied: Cannot view other users schedules');
      }

      console.log('🔍 Getting scheduled tasks for user:', { userId, requestedBy: currentUser.id });

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`)
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('❌ Supabase error in getScheduledTasksByUser:', error);
        throw new Error(`Failed to fetch user scheduled tasks: ${error.message}`);
      }

      console.log(`📊 Scheduled tasks for user ${userId}:`, data?.length || 0);
      return this.processScheduledTasks(data || []);
    } catch (error) {
      console.error('❌ Error in getScheduledTasksByUser:', error);
      throw error;
    }
  }

  // Get scheduled tasks in date range
  async getScheduledTasksInRange(startDate: string, endDate: string, userId?: string): Promise<ScheduledTask[]> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Check permissions for viewing other users
      const canViewAllSchedules = currentUser.name === 'Khổng Đức Mạnh' || currentUser.email === 'manh.khong@company.com';
      const targetUserId = userId || currentUser.id;

      if (!canViewAllSchedules && targetUserId !== currentUser.id) {
        throw new Error('Permission denied: Cannot view other users schedules');
      }

      console.log('🔍 Getting scheduled tasks in range:', {
        startDate,
        endDate,
        userId: targetUserId,
        requestedBy: currentUser.id,
        isAdmin: canViewAllSchedules
      });

      let query = supabase
        .from('tasks')
        .select('*')
        .not('scheduled_date', 'is', null)
        .gte('scheduled_date', startDate)
        .lte('scheduled_date', endDate);

      // Filter by user if specified or if not admin
      if (userId) {
        query = query.or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`);
      } else if (!canViewAllSchedules) {
        query = query.or(`created_by_id.eq.${currentUser.id},assigned_to_id.eq.${currentUser.id}`);
      }

      const { data, error } = await query
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('❌ Supabase error in getScheduledTasksInRange:', error);
        throw new Error(`Failed to fetch scheduled tasks: ${error.message}`);
      }

      console.log('📊 Raw scheduled tasks from database:', data?.length || 0);
      return this.processScheduledTasks(data || []);
    } catch (error) {
      console.error('❌ Error in getScheduledTasksInRange:', error);
      throw error;
    }
  }

  // Process and format scheduled tasks
  private processScheduledTasks(data: any[]): ScheduledTask[] {
    if (!data || data.length === 0) {
      return [];
    }

    console.log('📋 Processing scheduled tasks:', data.map(t => ({
      name: t.name,
      date: t.scheduled_date,
      time: t.scheduled_time,
      dateOnly: t.scheduled_date?.split('T')[0] // Remove timezone part
    })));

    return data.map(task => ({
      ...task,
      source: 'scheduled' as const
    }));
  }
}

export const schedulingService = new SchedulingService();
