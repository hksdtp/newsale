import { supabase } from '../shared/api/supabase';
import { Task, WorkType } from '../data/dashboardMockData';
import { getCurrentUser, getUserById, isDirector } from '../data/usersMockData';
import { authService } from '../features/auth/api/authService';

export interface CreateTaskData {
  name: string;
  description?: string;
  workType?: WorkType;
  workTypes?: WorkType[];
  priority: 'low' | 'normal' | 'high';
  campaignType?: string;
  platform?: string[];
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  assignedToId?: string;
  teamId?: string;
  department?: 'HN' | 'HCM';
  shareScope?: 'team' | 'private' | 'public';
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
  status?: 'new-requests' | 'approved' | 'live';
}

export interface TaskWithUsers extends Omit<Task, 'createdBy' | 'assignedTo'> {
  createdBy: {
    id: string;
    name: string;
    email: string;
    team_id?: string;
    location?: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
    email: string;
    team_id?: string;
    location?: string;
  } | null;
  shareScope?: 'team' | 'private' | 'public';
}

interface DbTask {
  id: string;
  name: string;
  description?: string;
  work_type: string;
  priority: string;
  status: string;
  campaign_type?: string;
  platform?: string[];
  start_date?: string;
  end_date?: string;
  due_date?: string;
  created_by_id?: string;
  assigned_to_id?: string;
  team_id?: string;
  department?: string;
  share_scope?: string;
  created_at?: string;
  updated_at?: string;
}

class TaskService {
  // Helper method to get user info from Supabase
  private async getUserInfo(userId: string) {
    if (!userId) return null;
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, team_id, location')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.warn('Error fetching user info:', error);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error('Error in getUserInfo:', error);
      return null;
    }
  }

  // Tạo task mới
  async createTask(taskData: CreateTaskData, createdById: string): Promise<TaskWithUsers> {
    try {
      const currentUser = getCurrentUser();
      
      // Prepare data for database
      const dbTask = {
        name: taskData.name,
        description: taskData.description || '',
        work_type: Array.isArray(taskData.workTypes) ? taskData.workTypes[0] || 'other' : taskData.workType || 'other',
        priority: taskData.priority || 'normal',
        status: 'new-requests',
        campaign_type: taskData.campaignType || '',
        platform: taskData.platform || [],
        start_date: taskData.startDate || new Date().toISOString(),
        end_date: taskData.endDate || null,
        due_date: taskData.dueDate || null,
        created_by_id: createdById,
        assigned_to_id: taskData.assignedToId || null,
        team_id: currentUser.team_id || null,
        department: taskData.department || (currentUser.location === 'Hà Nội' ? 'HN' : 'HCM'),
        share_scope: taskData.shareScope || 'team'
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('tasks')
        .insert(dbTask)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Không thể tạo công việc mới');
      }

      // Get user info for created_by and assigned_to
      const [createdByUser, assignedToUser] = await Promise.all([
        this.getUserInfo(data.created_by_id),
        this.getUserInfo(data.assigned_to_id)
      ]);

      // Return formatted task
      return this.mapDbTaskToTask(data, createdByUser, assignedToUser);
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Không thể tạo công việc mới');
    }
  }

  // Lấy tất cả tasks
  async getTasks(): Promise<TaskWithUsers[]> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      if (!tasks || tasks.length === 0) {
        return [];
      }

      // Get unique user IDs
      const userIds = new Set<string>();
      tasks.forEach(task => {
        if (task.created_by_id) userIds.add(task.created_by_id);
        if (task.assigned_to_id) userIds.add(task.assigned_to_id);
      });

      // Fetch all users at once
      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, team_id, location')
        .in('id', Array.from(userIds));

      const userMap = new Map();
      users?.forEach(user => userMap.set(user.id, user));

      // Map tasks with user info
      return tasks.map(task => this.mapDbTaskToTask(
        task,
        userMap.get(task.created_by_id),
        userMap.get(task.assigned_to_id)
      ));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Lấy tasks theo user
  async getTasksByUser(userId: string): Promise<TaskWithUsers[]> {
    try {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`created_by_id.eq.${userId},assigned_to_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user tasks:', error);
        return [];
      }

      if (!tasks || tasks.length === 0) {
        return [];
      }

      // Get user info
      const userIds = new Set<string>();
      tasks.forEach(task => {
        if (task.created_by_id) userIds.add(task.created_by_id);
        if (task.assigned_to_id) userIds.add(task.assigned_to_id);
      });

      const { data: users } = await supabase
        .from('users')
        .select('id, name, email, team_id, location')
        .in('id', Array.from(userIds));

      const userMap = new Map();
      users?.forEach(user => userMap.set(user.id, user));

      return tasks.map(task => this.mapDbTaskToTask(
        task,
        userMap.get(task.created_by_id),
        userMap.get(task.assigned_to_id)
      ));
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  }

  // Cập nhật task
  async updateTask(taskData: UpdateTaskData): Promise<TaskWithUsers> {
    try {
      const updateData: any = {};
      
      // Map fields to database columns
      if (taskData.name !== undefined) updateData.name = taskData.name;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      if (taskData.status !== undefined) updateData.status = taskData.status;
      if (taskData.workType !== undefined) updateData.work_type = taskData.workType;
      if (taskData.workTypes !== undefined && taskData.workTypes.length > 0) {
        updateData.work_type = taskData.workTypes[0];
      }
      if (taskData.campaignType !== undefined) updateData.campaign_type = taskData.campaignType;
      if (taskData.platform !== undefined) updateData.platform = taskData.platform;
      if (taskData.startDate !== undefined) updateData.start_date = taskData.startDate;
      if (taskData.endDate !== undefined) updateData.end_date = taskData.endDate;
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
      if (taskData.assignedToId !== undefined) updateData.assigned_to_id = taskData.assignedToId;
      if (taskData.department !== undefined) updateData.department = taskData.department;
      if (taskData.shareScope !== undefined) updateData.share_scope = taskData.shareScope;

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', taskData.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw new Error('Không thể cập nhật công việc');
      }

      // Get user info
      const [createdByUser, assignedToUser] = await Promise.all([
        this.getUserInfo(data.created_by_id),
        this.getUserInfo(data.assigned_to_id)
      ]);

      return this.mapDbTaskToTask(data, createdByUser, assignedToUser);
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Không thể cập nhật công việc');
    }
  }

  // Xóa task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Không thể xóa công việc');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw new Error('Không thể xóa công việc');
    }
  }

  // Lấy task theo ID
  async getTaskById(taskId: string): Promise<TaskWithUsers | null> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Get user info
      const [createdByUser, assignedToUser] = await Promise.all([
        this.getUserInfo(data.created_by_id),
        this.getUserInfo(data.assigned_to_id)
      ]);

      return this.mapDbTaskToTask(data, createdByUser, assignedToUser);
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw new Error('Không thể tải thông tin công việc');
    }
  }

  // Lọc tasks theo scope và user permissions
  filterTasksByScope(tasks: TaskWithUsers[], currentUserId: string, scope: 'my-tasks' | 'team-tasks' | 'department-tasks'): TaskWithUsers[] {
    const currentUser = getUserById(currentUserId) || getCurrentUser();
    const isUserDirector = isDirector(currentUserId);
    
    return tasks.filter(task => {
      // Director can see everything
      if (isUserDirector) {
        return true;
      }
      
      switch (scope) {
        case 'my-tasks':
          // "Của Tôi" - Only tasks assigned to or created by current user
          return (task.createdBy?.id === currentUserId || task.assignedTo?.id === currentUserId) &&
                 (task.shareScope === 'private' || 
                  task.shareScope === 'team' || 
                  task.shareScope === 'public');
        
        case 'team-tasks':
          // "Của Nhóm" - Tasks within user's team
          return task.shareScope === 'team' && 
                 (task.createdBy?.team_id === currentUser.team_id || 
                  task.assignedTo?.team_id === currentUser.team_id);
        
        case 'department-tasks':
          // "Công việc chung" - Public tasks in same location
          return task.shareScope === 'public' && 
                 task.department === (currentUser.location === 'Hà Nội' ? 'HN' : 'HCM');
        
        default:
          return false;
      }
    });
  }
  
  // Get filtered tasks for specific view
  async getFilteredTasks(scope: 'my-tasks' | 'team-tasks' | 'department-tasks', userId?: string): Promise<TaskWithUsers[]> {
    try {
      const allTasks = await this.getTasks();
      const currentUserId = userId || getCurrentUser().id;
      return this.filterTasksByScope(allTasks, currentUserId, scope);
    } catch (error) {
      console.error('Error fetching filtered tasks:', error);
      return [];
    }
  }

  // Map database task to frontend task format
  private mapDbTaskToTask(dbTask: DbTask, createdByUser?: any, assignedToUser?: any): TaskWithUsers {
    return {
      id: dbTask.id,
      name: dbTask.name || '',
      description: dbTask.description || '',
      workType: dbTask.work_type || 'other',
      priority: dbTask.priority as 'low' | 'normal' | 'high',
      status: dbTask.status as 'new-requests' | 'approved' | 'live',
      campaignType: dbTask.campaign_type || '',
      platform: dbTask.platform || [],
      startDate: dbTask.start_date ? new Date(dbTask.start_date).toLocaleDateString('vi-VN') : '',
      endDate: dbTask.end_date ? new Date(dbTask.end_date).toLocaleDateString('vi-VN') : '',
      dueDate: dbTask.due_date ? new Date(dbTask.due_date).toLocaleDateString('vi-VN') : '',
      department: dbTask.department as 'HN' | 'HCM' || 'HN',
      group: '',
      shareScope: dbTask.share_scope as 'team' | 'private' | 'public' || 'team',
      createdBy: createdByUser ? {
        id: createdByUser.id,
        name: createdByUser.name,
        email: createdByUser.email,
        team_id: createdByUser.team_id,
        location: createdByUser.location
      } : null,
      assignedTo: assignedToUser ? {
        id: assignedToUser.id,
        name: assignedToUser.name,
        email: assignedToUser.email,
        team_id: assignedToUser.team_id,
        location: assignedToUser.location
      } : null,
      createdAt: dbTask.created_at
    };
  }
}

export const taskService = new TaskService();
