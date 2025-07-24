import { supabase } from '../shared/api/supabase';
import { Task, WorkType } from '../data/dashboardMockData';
import { mockUsers, getCurrentUser, getUserById, isDirector } from '../data/usersMockData';

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

class TaskService {
  // Tạo task mới
  async createTask(taskData: CreateTaskData, createdById: string): Promise<TaskWithUsers> {
    try {
      // Tạo UUID cho task mới
      const taskId = crypto.randomUUID();
      
      // Get current user data
      const currentUser = getCurrentUser();
      const assignedUser = taskData.assignedToId ? getUserById(taskData.assignedToId) : null;

      // Tạo task object với proper user data và shareScope
      const newTask: TaskWithUsers = {
        id: taskId,
        name: taskData.name,
        description: taskData.description || '',
        workType: Array.isArray(taskData.workTypes) ? taskData.workTypes[0] || 'other' : taskData.workType || 'other',
        priority: taskData.priority || 'normal',
        status: 'new-requests',
        campaignType: taskData.campaignType || '',
        platform: taskData.platform || [],
        startDate: taskData.startDate || new Date().toLocaleDateString('vi-VN'),
        endDate: taskData.endDate || '',
        dueDate: taskData.dueDate || '',
        department: taskData.department || (currentUser.location === 'Hà Nội' ? 'HN' : 'HCM'),
        group: currentUser.team?.name || '',
        shareScope: taskData.shareScope || 'team',
        createdBy: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          team_id: currentUser.team_id,
          location: currentUser.location
        },
        assignedTo: assignedUser ? {
          id: assignedUser.id,
          name: assignedUser.name,
          email: assignedUser.email,
          team_id: assignedUser.team_id,
          location: assignedUser.location
        } : null,
        createdAt: new Date().toISOString()
      };

      // Lưu vào localStorage
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      existingTasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(existingTasks));

      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Không thể tạo công việc mới');
    }
  }

  // Lấy tất cả tasks
  async getTasks(): Promise<TaskWithUsers[]> {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Lấy tasks theo user
  async getTasksByUser(userId: string): Promise<TaskWithUsers[]> {
    try {
      const allTasks = await this.getTasks();
      return allTasks.filter(task =>
        task.createdBy?.id === userId || task.assignedTo?.id === userId
      );
    } catch (error) {
      console.error('Error fetching user tasks:', error);
      return [];
    }
  }

  // Cập nhật task
  async updateTask(taskData: UpdateTaskData): Promise<TaskWithUsers> {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const taskIndex = tasks.findIndex((task: TaskWithUsers) => task.id === taskData.id);

      if (taskIndex === -1) {
        throw new Error('Không tìm thấy công việc');
      }

      // Cập nhật task
      if (taskData.name !== undefined) tasks[taskIndex].name = taskData.name;
      if (taskData.description !== undefined) tasks[taskIndex].description = taskData.description;
      if (taskData.priority !== undefined) tasks[taskIndex].priority = taskData.priority;
      if (taskData.status !== undefined) tasks[taskIndex].status = taskData.status;
      if (taskData.startDate !== undefined) tasks[taskIndex].startDate = taskData.startDate;
      if (taskData.department !== undefined) tasks[taskIndex].department = taskData.department;

      localStorage.setItem('tasks', JSON.stringify(tasks));
      return tasks[taskIndex];
    } catch (error) {
      console.error('Error updating task:', error);
      throw new Error('Không thể cập nhật công việc');
    }
  }

  // Xóa task
  async deleteTask(taskId: string): Promise<void> {
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const filteredTasks = tasks.filter((task: TaskWithUsers) => task.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(filteredTasks));
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

      return this.mapDbTaskToTask(data);
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
  private mapDbTaskToTask(dbTask: any): TaskWithUsers {
    return {
      id: dbTask.id,
      name: dbTask.name || '',
      description: dbTask.description || '',
      workType: dbTask.work_type || 'other',
      priority: dbTask.priority || 'normal',
      status: dbTask.status || 'new-requests',
      campaignType: dbTask.campaign_type || '',
      platform: dbTask.platform || [],
      startDate: dbTask.start_date ? new Date(dbTask.start_date).toLocaleDateString('vi-VN') : '',
      endDate: dbTask.end_date ? new Date(dbTask.end_date).toLocaleDateString('vi-VN') : '',
      dueDate: dbTask.due_date ? new Date(dbTask.due_date).toLocaleDateString('vi-VN') : '',
      department: dbTask.department || 'HN',
      group: '',
      shareScope: dbTask.share_scope || 'team',
      createdBy: {
        id: dbTask.created_by_id || '',
        name: 'Current User',
        email: ''
      },
      assignedTo: dbTask.assigned_to_id ? {
        id: dbTask.assigned_to_id,
        name: 'Assigned User',
        email: ''
      } : null
    };
  }
}

export const taskService = new TaskService();
