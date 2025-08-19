import { supabase } from '../shared/api/supabase';

/**
 * 🤖 AUTO-MOVE SERVICE
 * Automatically moves scheduled tasks to current day
 */

export interface AutoMoveResult {
  success: boolean;
  movedCount: number;
  error?: string;
}

class AutoMoveService {
  // Move scheduled tasks to today
  async moveScheduledTasksToToday(): Promise<AutoMoveResult> {
    try {
      console.log('🤖 Auto-move: Checking for scheduled tasks to move...');



      const today = new Date().toISOString().split('T')[0];

      // Get tasks scheduled for today that haven't been moved yet
      const { data: tasksToMove, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('scheduled_date', today)
        .eq('source', 'manual') // Only move tasks that haven't been moved yet
        .not('scheduled_date', 'is', null);

      if (fetchError) {
        console.error('Auto-move fetch error:', fetchError);
        return { success: false, movedCount: 0, error: fetchError.message };
      }

      if (!tasksToMove || tasksToMove.length === 0) {
        console.log('🤖 Auto-move: No tasks to move today');
        return { success: true, movedCount: 0 };
      }

      console.log(`🤖 Auto-move: Found ${tasksToMove.length} tasks to move`);

      // Update tasks to mark them as moved from schedule
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          source: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .in('id', tasksToMove.map(task => task.id));

      if (updateError) {
        console.error('Auto-move update error:', updateError);
        return { success: false, movedCount: 0, error: updateError.message };
      }

      console.log(`✅ Auto-move: Successfully moved ${tasksToMove.length} tasks`);
      
      return { 
        success: true, 
        movedCount: tasksToMove.length 
      };
    } catch (error) {
      console.error('Auto-move service error:', error);
      return { 
        success: false, 
        movedCount: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Check and move overdue scheduled tasks
  async moveOverdueScheduledTasks(): Promise<AutoMoveResult> {
    try {
      console.log('🤖 Auto-move: Checking for overdue scheduled tasks...');



      const today = new Date().toISOString().split('T')[0];

      // Get tasks scheduled for past dates that haven't been moved yet
      const { data: overdueTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .lt('scheduled_date', today)
        .eq('source', 'manual')
        .not('scheduled_date', 'is', null);

      if (fetchError) {
        console.error('Auto-move overdue fetch error:', fetchError);
        return { success: false, movedCount: 0, error: fetchError.message };
      }

      if (!overdueTasks || overdueTasks.length === 0) {
        console.log('🤖 Auto-move: No overdue tasks to move');
        return { success: true, movedCount: 0 };
      }

      console.log(`🤖 Auto-move: Found ${overdueTasks.length} overdue tasks to move`);

      // Update overdue tasks to mark them as moved and set status to overdue
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          source: 'scheduled',
          status: 'overdue',
          updated_at: new Date().toISOString()
        })
        .in('id', overdueTasks.map(task => task.id));

      if (updateError) {
        console.error('Auto-move overdue update error:', updateError);
        return { success: false, movedCount: 0, error: updateError.message };
      }

      console.log(`✅ Auto-move: Successfully moved ${overdueTasks.length} overdue tasks`);
      
      return { 
        success: true, 
        movedCount: overdueTasks.length 
      };
    } catch (error) {
      console.error('Auto-move overdue service error:', error);
      return { 
        success: false, 
        movedCount: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Run full auto-move process
  async runAutoMove(): Promise<{ today: AutoMoveResult; overdue: AutoMoveResult }> {
    console.log('🤖 Starting auto-move process...');
    
    const todayResult = await this.moveScheduledTasksToToday();
    const overdueResult = await this.moveOverdueScheduledTasks();
    
    const totalMoved = todayResult.movedCount + overdueResult.movedCount;
    
    if (totalMoved > 0) {
      console.log(`🎉 Auto-move completed: ${totalMoved} tasks moved`);
    } else {
      console.log('✨ Auto-move completed: No tasks to move');
    }
    
    return {
      today: todayResult,
      overdue: overdueResult
    };
  }

  // Schedule auto-move to run periodically
  startAutoMoveScheduler(intervalMinutes: number = 60) {
    console.log(`🤖 Starting auto-move scheduler (every ${intervalMinutes} minutes)`);
    
    // Run immediately
    this.runAutoMove();
    
    // Then run every interval
    setInterval(() => {
      this.runAutoMove();
    }, intervalMinutes * 60 * 1000);
  }

  // Manual trigger for testing
  async triggerManualAutoMove(): Promise<string> {
    const result = await this.runAutoMove();
    
    const todayMoved = result.today.movedCount;
    const overdueMoved = result.overdue.movedCount;
    const totalMoved = todayMoved + overdueMoved;
    
    if (totalMoved === 0) {
      return 'Không có công việc nào cần chuyển.';
    }
    
    let message = `Đã chuyển ${totalMoved} công việc:`;
    if (todayMoved > 0) {
      message += `\n- ${todayMoved} công việc hôm nay`;
    }
    if (overdueMoved > 0) {
      message += `\n- ${overdueMoved} công việc quá hạn`;
    }
    
    return message;
  }
}

export const autoMoveService = new AutoMoveService();
