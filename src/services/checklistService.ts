import { getCurrentUser } from '../data/usersMockData';
import { supabase } from '../shared/api/supabase';

export interface ChecklistItem {
  id: string;
  task_id: string;
  title: string;
  is_completed: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateChecklistItemData {
  taskId: string;
  title: string;
  orderIndex?: number;
}

export interface UpdateChecklistItemData {
  id: string;
  title?: string;
  isCompleted?: boolean;
  orderIndex?: number;
}

export interface ChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
}

class ChecklistService {
  // Create new checklist item
  async createChecklistItem(data: CreateChecklistItemData): Promise<ChecklistItem> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Simplified - just verify task exists
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', data.taskId)
        .single();

      if (taskError || !task) {
        throw new Error('Task not found');
      }

      // Get the next order index if not provided
      let orderIndex = data.orderIndex;
      if (orderIndex === undefined) {
        const { data: lastItem } = await supabase
          .from('task_checklist_items')
          .select('order_index')
          .eq('task_id', data.taskId)
          .order('order_index', { ascending: false })
          .limit(1)
          .single();

        orderIndex = lastItem ? lastItem.order_index + 1 : 0;
      }

      // Insert new checklist item
      const { data: checklistItem, error } = await supabase
        .from('task_checklist_items')
        .insert({
          task_id: data.taskId,
          title: data.title,
          order_index: orderIndex,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating checklist item:', error);
        throw new Error('Failed to create checklist item');
      }

      return checklistItem;
    } catch (error) {
      console.error('Create checklist item error:', error);
      throw error;
    }
  }

  // Get checklist items for a task
  async getTaskChecklistItems(taskId: string): Promise<ChecklistItem[]> {
    try {
      const { data, error } = await supabase
        .from('task_checklist_items')
        .select('*')
        .eq('task_id', taskId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching checklist items:', error);
        throw new Error('Failed to fetch checklist items');
      }

      return data || [];
    } catch (error) {
      console.error('Get task checklist items error:', error);
      throw error;
    }
  }

  // Update checklist item
  async updateChecklistItem(data: UpdateChecklistItemData): Promise<ChecklistItem> {
    try {
      // Simplified - no authorization check for now
      // Just verify the item exists
      const { data: existingItem, error: checkError } = await supabase
        .from('task_checklist_items')
        .select('id')
        .eq('id', data.id)
        .single();

      if (checkError || !existingItem) {
        throw new Error('Checklist item not found');
      }

      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(), // Luôn cập nhật updated_at
      };
      if (data.title !== undefined) updateData.title = data.title;
      if (data.isCompleted !== undefined) updateData.is_completed = data.isCompleted;
      if (data.orderIndex !== undefined) updateData.order_index = data.orderIndex;

      // Update checklist item
      const { data: updatedItem, error } = await supabase
        .from('task_checklist_items')
        .update(updateData)
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating checklist item:', error);
        throw new Error('Failed to update checklist item');
      }

      return updatedItem;
    } catch (error) {
      console.error('Update checklist item error:', error);
      throw error;
    }
  }

  // Delete checklist item
  async deleteChecklistItem(itemId: string): Promise<void> {
    try {
      // Simplified - no authorization check for now
      // Just verify the item exists before deleting
      const { data: existingItem, error: checkError } = await supabase
        .from('task_checklist_items')
        .select('id')
        .eq('id', itemId)
        .single();

      if (checkError || !existingItem) {
        throw new Error('Checklist item not found');
      }

      // Delete checklist item
      const { error } = await supabase.from('task_checklist_items').delete().eq('id', itemId);

      if (error) {
        console.error('Error deleting checklist item:', error);
        throw new Error('Failed to delete checklist item');
      }
    } catch (error) {
      console.error('Delete checklist item error:', error);
      throw error;
    }
  }

  // Reorder checklist items
  async reorderChecklistItems(taskId: string, itemIds: string[]): Promise<void> {
    try {
      // Simplified - no authorization check for now
      // Just verify the task exists
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .single();

      if (taskError || !task) {
        throw new Error('Task not found');
      }

      // Update order_index for each item
      const updates = itemIds.map((itemId, index) =>
        supabase
          .from('task_checklist_items')
          .update({ order_index: index })
          .eq('id', itemId)
          .eq('task_id', taskId)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Reorder checklist items error:', error);
      throw error;
    }
  }

  // Get checklist progress for a task
  async getChecklistProgress(taskId: string): Promise<ChecklistProgress> {
    try {
      const { data, error } = await supabase.rpc('get_task_checklist_progress', {
        task_uuid: taskId,
      });

      if (error) {
        console.error('Error getting checklist progress:', error);
        throw new Error('Failed to get checklist progress');
      }

      return data || { total: 0, completed: 0, percentage: 0 };
    } catch (error) {
      console.error('Get checklist progress error:', error);
      // Fallback to manual calculation
      try {
        const items = await this.getTaskChecklistItems(taskId);
        const total = items.length;
        const completed = items.filter(item => item.is_completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, percentage };
      } catch (fallbackError) {
        console.error('Fallback progress calculation error:', fallbackError);
        return { total: 0, completed: 0, percentage: 0 };
      }
    }
  }

  // Toggle checklist item completion
  async toggleChecklistItem(itemId: string): Promise<ChecklistItem> {
    try {
      // Get current state
      const { data: currentItem, error: fetchError } = await supabase
        .from('task_checklist_items')
        .select('is_completed')
        .eq('id', itemId)
        .single();

      if (fetchError || !currentItem) {
        throw new Error('Checklist item not found');
      }

      // Toggle completion state
      return await this.updateChecklistItem({
        id: itemId,
        isCompleted: !currentItem.is_completed,
      });
    } catch (error) {
      console.error('Toggle checklist item error:', error);
      throw error;
    }
  }

  // Bulk update checklist items
  async bulkUpdateChecklistItems(updates: UpdateChecklistItemData[]): Promise<ChecklistItem[]> {
    try {
      const results = await Promise.all(updates.map(update => this.updateChecklistItem(update)));
      return results;
    } catch (error) {
      console.error('Bulk update checklist items error:', error);
      throw error;
    }
  }
}

export const checklistService = new ChecklistService();
