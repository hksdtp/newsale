import { supabase } from '../shared/api/supabase';
import { Task, WorkType } from '../data/dashboardMockData';
import { getCurrentUser, getUserById, isDirector } from '../data/usersMockData';
import { authService } from '../features/auth/api/authService';
import {
  canViewTeamTasks,
  canViewLocationTasks,
  getCurrentUserPermissions,
  UserRole
} from '../utils/roleBasedPermissions';

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
  createdAt?: string; // Ngày tạo task (có thể khác ngày hiện tại)
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string;
  status?: 'new-requests' | 'approved' | 'live';
  source?: 'manual' | 'scheduled' | 'recurring';
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
  createdAt?: string; // Ngày tạo từ database
  source?: 'manual' | 'scheduled' | 'recurring';
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
  // Helper method to filter scheduled tasks based on date
  private filterScheduledTasks(tasks: any[]): any[] {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    return tasks.filter(task => {
      // If task has scheduled_date and source is 'checklist_item'
      if (task.scheduled_date && task.source === 'checklist_item') {
        const scheduledDate = task.scheduled_date.split('T')[0]; // Extract date part
        // Only show if scheduled date is today or past
        return scheduledDate <= today;
      }
      // Show all other tasks normally
      return true;
    });
  }

  // Helper method to clean date fields - convert empty strings to null and validate format
  private cleanDateFields(data: any): any {
    const cleaned = { ...data };

    // List of all possible date fields
    const dateFields = [
      'start_date', 'end_date', 'due_date',
      'scheduled_date', 'created_at', 'updated_at'
    ];

    dateFields.forEach(field => {
      if (field in cleaned) {
        const value = cleaned[field];

        // Convert empty strings to null
        if (value === '') {
          cleaned[field] = null;
        }
        // Validate and convert date format if needed
        else if (value && typeof value === 'string') {
          // Check if it's DD/MM/YYYY format and convert to YYYY-MM-DD
          const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          const match = value.match(ddmmyyyyPattern);

          if (match) {
            const [, day, month, year] = match;
            const isoDate = `${year}-${month}-${day}`;
            console.log(`🔧 Converting date format: ${value} → ${isoDate}`);
            cleaned[field] = isoDate;
          }
          // If it's already ISO format or other valid format, keep it
          else if (value.includes('-') || value.includes('T')) {
            // Looks like ISO format, keep as is
            cleaned[field] = value;
          }
          else {
            console.warn(`⚠️  Unknown date format for ${field}:`, value);
          }
        }
      }
    });

    return cleaned;
  }
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
      // Get current user from Supabase instead of mock data
      const currentUser = await this.getUserInfo(createdById);
      if (!currentUser) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      // Prepare data for database (without share_scope for now)
      const dbTask = {
        name: taskData.name,
        description: taskData.description || '',
        work_type: Array.isArray(taskData.workTypes) && taskData.workTypes.length > 0 ? taskData.workTypes[0] : (taskData.workType || 'other'),
        priority: taskData.priority || 'normal',
        status: 'new-requests',
        campaign_type: taskData.campaignType || '',
        platform: taskData.platform || [],
        start_date: taskData.startDate || new Date().toISOString(),
        end_date: taskData.endDate || null,
        due_date: taskData.dueDate || null,
        created_by_id: createdById,
        assigned_to_id: taskData.assignedToId || createdById, // If no assignee, assign to creator
        team_id: currentUser.team_id || null,
        department: taskData.department || (currentUser.location === 'Hà Nội' ? 'HN' : 'HCM')
        // share_scope removed temporarily until table schema is updated
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

      // Filter out scheduled tasks that haven't reached their scheduled date
      const filteredTasks = this.filterScheduledTasks(tasks);

      console.log('📅 Task filtering in getTasks:', {
        totalTasks: tasks.length,
        filteredTasks: filteredTasks.length,
        today: new Date().toISOString().split('T')[0],
        hiddenScheduledTasks: tasks.length - filteredTasks.length
      });

      // Get unique user IDs from filtered tasks
      const userIds = new Set<string>();
      filteredTasks.forEach(task => {
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

      // Map filtered tasks with user info
      return filteredTasks.map(task => this.mapDbTaskToTask(
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
      console.log('🔧 TaskService.updateTask called with:', taskData);

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
      // Handle date fields - convert empty strings to null
      if (taskData.startDate !== undefined) {
        updateData.start_date = taskData.startDate === '' ? null : taskData.startDate;
      }
      if (taskData.endDate !== undefined) {
        updateData.end_date = taskData.endDate === '' ? null : taskData.endDate;
      }
      if (taskData.dueDate !== undefined) {
        updateData.due_date = taskData.dueDate === '' ? null : taskData.dueDate;
      }
      if (taskData.assignedToId !== undefined) updateData.assigned_to_id = taskData.assignedToId;
      if (taskData.department !== undefined) updateData.department = taskData.department;

      // Handle any potential scheduled date fields
      if ('scheduledDate' in taskData && taskData.scheduledDate !== undefined) {
        updateData.scheduled_date = taskData.scheduledDate === '' ? null : taskData.scheduledDate;
      }
      if ('scheduledTime' in taskData && taskData.scheduledTime !== undefined) {
        updateData.scheduled_time = taskData.scheduledTime === '' ? null : taskData.scheduledTime;
      }

      // shareScope removed - column doesn't exist in current table schema

      // Clean all date fields - convert empty strings to null
      const cleanedUpdateData = this.cleanDateFields(updateData);

      console.log('🔧 Mapped update data for database:', cleanedUpdateData);

      const { data, error } = await supabase
        .from('tasks')
        .update(cleanedUpdateData)
        .eq('id', taskData.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update error:', error);
        console.error('❌ Failed update data:', cleanedUpdateData);
        console.error('❌ Task ID:', taskData.id);
        throw new Error(`Không thể cập nhật công việc: ${error.message}`);
      }

      console.log('✅ Task updated successfully in database:', data.id);

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
          return task.shareScope === 'private' && (task.createdBy?.id === currentUserId || task.assignedTo?.id === currentUserId);
        
        case 'team-tasks':
          // "Của Nhóm" - Tasks within user's team
          return task.shareScope === 'team';
        
        case 'department-tasks':
          // "Công việc chung" - Public tasks that can be seen by everyone
          return task.shareScope === 'public';
        
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
      workType: (dbTask.work_type || 'other') as WorkType,
      priority: dbTask.priority as 'low' | 'normal' | 'high',
      status: dbTask.status as 'new-requests' | 'approved' | 'live',
      campaignType: dbTask.campaign_type || '',
      platform: dbTask.platform || [],
      startDate: dbTask.start_date ? new Date(dbTask.start_date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : (dbTask.created_at ? new Date(dbTask.created_at).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : new Date().toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'})),
      endDate: dbTask.end_date ? new Date(dbTask.end_date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '',
      dueDate: dbTask.due_date ? new Date(dbTask.due_date).toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '',
      createdAt: dbTask.created_at || new Date().toISOString(),
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
      } : null
    };
  }

  // Role-based task filtering methods

  // Get tasks for "Của tôi" tab
  async getMyTasks(userId?: string): Promise<TaskWithUsers[]> {
    try {
      const currentUser = userId ? await this.getUserInfo(userId) : getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`created_by_id.eq.${currentUser.id},assigned_to_id.eq.${currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my tasks:', error);
        throw new Error('Không thể tải công việc của tôi');
      }

      // Apply scheduled task filtering
      const filteredTasks = this.filterScheduledTasks(data || []);

      console.log('📅 Task filtering in getMyTasks:', {
        totalTasks: data?.length || 0,
        filteredTasks: filteredTasks.length,
        hiddenScheduledTasks: (data?.length || 0) - filteredTasks.length
      });

      return this.mapDbTasksToTasks(filteredTasks);
    } catch (error) {
      console.error('Error in getMyTasks:', error);
      throw error;
    }
  }

  // Get tasks for "Của nhóm" tab with role-based filtering
  async getTeamTasks(teamId?: string, location?: 'HN' | 'HCM'): Promise<TaskWithUsers[]> {
    try {
      const currentUser = getCurrentUser();
      const permissions = getCurrentUserPermissions();

      let query = supabase.from('tasks').select('*');

      if (currentUser.role === 'retail_director') {
        // Directors can view all teams or filter by specific team/location
        if (teamId) {
          query = query.eq('team_id', teamId);
        }
        if (location) {
          query = query.eq('department', location);
        }
      } else {
        // Team leaders and employees can only see their own team
        query = query.eq('team_id', currentUser.team_id);

        // Also filter by location for non-directors
        const userLocation = currentUser.location === 'Hà Nội' ? 'HN' : 'HCM';
        query = query.eq('department', userLocation);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team tasks:', error);
        throw new Error('Không thể tải công việc của nhóm');
      }

      return this.mapDbTasksToTasks(data || []);
    } catch (error) {
      console.error('Error in getTeamTasks:', error);
      throw error;
    }
  }

  // Get tasks for "Công việc chung" tab (department-wide tasks)
  async getDepartmentTasks(location?: 'HN' | 'HCM'): Promise<TaskWithUsers[]> {
    try {
      const currentUser = getCurrentUser();
      const permissions = getCurrentUserPermissions();

      let query = supabase.from('tasks').select('*');

      if (currentUser.role === 'retail_director') {
        // Directors can view all locations or filter by specific location
        if (location) {
          query = query.eq('department', location);
        }
      } else {
        // Non-directors can only see their own location AND their own team's tasks
        const userLocation = currentUser.location === 'Hà Nội' ? 'HN' : 'HCM';
        query = query
          .eq('department', userLocation)
          .eq('team_id', currentUser.team_id); // Only show tasks from user's own team
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching department tasks:', error);
        throw new Error('Không thể tải công việc chung');
      }

      return this.mapDbTasksToTasks(data || []);
    } catch (error) {
      console.error('Error in getDepartmentTasks:', error);
      throw error;
    }
  }

  // Get available teams for current user (for team selector)
  async getAvailableTeams(): Promise<any[]> {
    try {
      const currentUser = getCurrentUser();
      const permissions = getCurrentUserPermissions();

      if (permissions.canViewAllTeams) {
        // Directors can see all teams
        const { data: teams, error } = await supabase
          .from('teams')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching all teams:', error);
          return [];
        }

        return teams || [];
      } else {
        // Team leaders and employees can only see their own team
        const { data: team, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', currentUser.team_id)
          .single();

        if (error) {
          console.error('Error fetching user team:', error);
          return [];
        }

        return team ? [team] : [];
      }
    } catch (error) {
      console.error('Error in getAvailableTeams:', error);
      return [];
    }
  }

  // Helper method to map multiple DB tasks to TaskWithUsers
  private async mapDbTasksToTasks(dbTasks: any[]): Promise<TaskWithUsers[]> {
    if (!dbTasks || dbTasks.length === 0) {
      return [];
    }

    const tasks = await Promise.all(
      dbTasks.map(async (dbTask) => {
        const [createdByUser, assignedToUser] = await Promise.all([
          this.getUserInfo(dbTask.created_by_id),
          this.getUserInfo(dbTask.assigned_to_id)
        ]);

        return this.mapDbTaskToTask(dbTask, createdByUser, assignedToUser);
      })
    );

    return tasks;
  }

  // Create scheduled task for checklist item
  async createScheduledChecklistItem(data: {
    itemTitle: string;
    parentTaskId: string;
    checklistItemId: string;
    scheduledDate: string;
    scheduledTime?: string;
  }) {
    try {
      // Get current user from localStorage (set during login)
      const currentUserId = localStorage.getItem('currentUserId');
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      const currentUserName = localStorage.getItem('currentUserName');

      if (!currentUserId || !currentUserEmail) {
        throw new Error('Người dùng chưa đăng nhập');
      }

      console.log('👤 Current user for checklist scheduling:', {
        id: currentUserId,
        email: currentUserEmail,
        name: currentUserName
      });

      // Get user details from database to get team_id and location
      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('team_id, location, department_type')
        .eq('id', currentUserId)
        .single();

      if (userError) {
        console.warn('⚠️  Could not get user details:', userError.message);
      }

      console.log('👤 User details from database:', userDetails);

      // Get parent task name for cleaner description
      const { data: parentTask, error: parentError } = await supabase
        .from('tasks')
        .select('name')
        .eq('id', data.parentTaskId)
        .single();

      if (parentError) {
        console.warn('⚠️  Could not get parent task name:', parentError.message);
      }

      const parentTaskName = parentTask?.name || 'Unknown Task';
      console.log('📋 Parent task name:', parentTaskName);

      console.log('📅 Creating scheduled task for checklist item:', data);

      const taskData = {
        name: data.itemTitle,                   // Clean item name: "Gặp khách hàng"
        description: `Từ: ${parentTaskName}`,   // Vietnamese: "Từ: Parent Task Name"
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime || null,
        source: 'checklist_item',
        priority: 'medium',
        status: 'new-requests',
        work_type: 'other',                     // Use 'other' as default
        created_by_id: currentUserId,        // ✅ Correct column name
        assigned_to_id: currentUserId,       // ✅ Correct column name
        team_id: userDetails?.team_id || null, // Use user's team_id
        department: userDetails?.location || 'unknown' // Use user's location
      };

      console.log('📋 Task data before cleaning:', taskData);

      const cleanedData = this.cleanDateFields(taskData);

      const { data: result, error } = await supabase
        .from('tasks')
        .insert([cleanedData])
        .select('*')
        .single();

      if (error) {
        console.error('❌ Supabase error creating scheduled checklist item:', error);
        console.error('❌ Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Không thể tạo lịch: ${error.message}`);
      }

      console.log('✅ Scheduled checklist item created:', result);
      return result;

    } catch (error) {
      console.error('❌ Error creating scheduled checklist item:', error);
      throw error;
    }
  }
}

export const taskService = new TaskService();
