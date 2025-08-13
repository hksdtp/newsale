import { Task, WorkType } from '../data/dashboardMockData';
import { getCurrentUser, getUserById, isDirector } from '../data/usersMockData';
import { supabase } from '../shared/api/supabase';
import { getCurrentUserPermissions } from '../utils/roleBasedPermissions';
import { withUserContext } from './authContextService';

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
  work_type: string[]; // Changed to array
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
      // If task has scheduled_date, filter based on source type
      if (task.scheduled_date) {
        const scheduledDate = task.scheduled_date.split('T')[0]; // Extract date part

        // For tasks from checklist items, only show if scheduled date is today or past
        if (task.source === 'checklist_item') {
          return scheduledDate <= today;
        }

        // For manually scheduled tasks (from Planning), only show when it's the scheduled date
        if (task.source === 'manual' || task.source === 'scheduled') {
          return scheduledDate <= today;
        }
      }

      // Show all other tasks normally (non-scheduled tasks)
      return true;
    });
  }

  // Helper method to clean date fields - convert empty strings to null and validate format
  private cleanDateFields(data: any): any {
    const cleaned = { ...data };

    // List of all possible date fields
    const dateFields = [
      'start_date',
      'end_date',
      'due_date',
      'scheduled_date',
      'created_at',
      'updated_at',
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
          } else {
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

      // Prepare data for database
      const dbTask = {
        name: taskData.name,
        description: taskData.description || '',
        work_type:
          Array.isArray(taskData.workTypes) && taskData.workTypes.length > 0
            ? taskData.workTypes // Use full array instead of just first element
            : taskData.workType
              ? [taskData.workType] // Convert single workType to array
              : ['other'], // Default array
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
        department: taskData.department || (currentUser.location === 'Hà Nội' ? 'HN' : 'HCM'),
        share_scope: taskData.shareScope || 'team', // Add share_scope back
      };

      // Insert into Supabase
      const { data, error } = await supabase.from('tasks').insert(dbTask).select().single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error('Không thể tạo công việc mới');
      }

      // Get user info for created_by and assigned_to
      const [createdByUser, assignedToUser] = await Promise.all([
        this.getUserInfo(data.created_by_id),
        this.getUserInfo(data.assigned_to_id),
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
    return await withUserContext(async () => {
      try {
        const { data: tasks, error } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      console.log('🔍 Raw tasks from database:', tasks?.length || 0);
      console.log('🔍 Sample tasks:', tasks?.slice(0, 3));

      if (!tasks || tasks.length === 0) {
        console.log('⚠️ No tasks found in database');
        return [];
      }

      // Filter out scheduled tasks that haven't reached their scheduled date
      const filteredTasks = this.filterScheduledTasks(tasks);

      console.log('📅 Task filtering in getTasks:', {
        totalTasks: tasks.length,
        filteredTasks: filteredTasks.length,
        today: new Date().toISOString().split('T')[0],
        hiddenScheduledTasks: tasks.length - filteredTasks.length,
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
        return filteredTasks.map(task =>
          this.mapDbTaskToTask(
            task,
            userMap.get(task.created_by_id),
            userMap.get(task.assigned_to_id)
          )
        );
      } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }
    });
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

      return tasks.map(task =>
        this.mapDbTaskToTask(
          task,
          userMap.get(task.created_by_id),
          userMap.get(task.assigned_to_id)
        )
      );
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
      // Work types: support array and single
      if (taskData.workTypes !== undefined) {
        updateData.work_type = taskData.workTypes; // store full array
      } else if (taskData.workType !== undefined) {
        updateData.work_type = [taskData.workType];
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
      if (taskData.shareScope !== undefined) updateData.share_scope = taskData.shareScope;

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
        this.getUserInfo(data.assigned_to_id),
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
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);

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
      const { data, error } = await supabase.from('tasks').select('*').eq('id', taskId).single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      // Get user info
      const [createdByUser, assignedToUser] = await Promise.all([
        this.getUserInfo(data.created_by_id),
        this.getUserInfo(data.assigned_to_id),
      ]);

      return this.mapDbTaskToTask(data, createdByUser, assignedToUser);
    } catch (error) {
      console.error('Error fetching task by ID:', error);
      throw new Error('Không thể tải thông tin công việc');
    }
  }

  // Lọc tasks theo scope và user permissions với shareScope
  filterTasksByScope(
    tasks: TaskWithUsers[],
    currentUserId: string,
    scope: 'my-tasks' | 'team-tasks' | 'department-tasks'
  ): TaskWithUsers[] {
    const currentUser = getUserById(currentUserId) || getCurrentUser();
    const isUserDirector = isDirector(currentUserId);
    const userTeamId = currentUser?.team_id;
    const userDepartment = currentUser?.location === 'Hà Nội' ? 'HN' : 'HCM';

    console.log('🔍 filterTasksByScope debug:', {
      scope,
      currentUserId,
      currentUser: currentUser?.name,
      currentUserRole: currentUser?.role,
      isUserDirector,
      userTeamId,
      userDepartment,
      totalTasks: tasks.length,
    });

    if (!isUserDirector) {
      console.log('⚠️ User is NOT director, using regular filter logic');
    } else {
      console.log('✅ User IS director, using simplified logic');
    }

    // Helper function to get effective shareScope (with fallback)
    const getEffectiveShareScope = (task: TaskWithUsers): string => {
      if (task.shareScope) {
        console.log(`✅ Task ${task.id} has shareScope: ${task.shareScope}`);
        return task.shareScope;
      }

      // Fallback logic if shareScope is null/undefined
      if (task.createdBy?.id === currentUserId || task.assignedTo?.id === currentUserId) {
        console.log(`🔄 Task ${task.id} fallback to private (own task)`);
        return 'private'; // Tasks created by or assigned to user are private
      }

      // Default to team scope for other tasks
      console.log(`🔄 Task ${task.id} fallback to team (default)`);
      return 'team';
    };

    return tasks.filter(task => {
      const effectiveShareScope = getEffectiveShareScope(task);

      const result = (() => {
        switch (scope) {
          case 'my-tasks':
            // "Của Tôi" - Private tasks OR tasks assigned to me OR tasks I created
            if (isUserDirector) {
              // Directors can see tasks created by them or assigned to them
              // Check by both ID and name (mock data uses names)
              const result =
                task.createdBy?.id === currentUserId ||
                task.assignedTo?.id === currentUserId ||
                task.createdBy?.name === currentUser?.name ||
                task.assignedTo?.name === currentUser?.name;
              console.log(
                `🔍 Director my-tasks: ${task.name} - createdBy: ${task.createdBy}, assignedTo: ${task.assignedTo}, currentUser: ${currentUser?.name} - ${result ? 'INCLUDED' : 'EXCLUDED'}`
              );
              return result;
            } else {
              return (
                effectiveShareScope === 'private' ||
                task.createdBy?.id === currentUserId ||
                task.assignedTo?.id === currentUserId ||
                task.createdBy?.name === currentUser?.name ||
                task.assignedTo?.name === currentUser?.name
              );
            }

          case 'team-tasks':
            // "Của Nhóm" - Team scope tasks OR tasks assigned to teams
            if (isUserDirector) {
              // Directors can see ALL tasks (simplified logic)
              console.log(`🔍 Director sees all tasks: ${task.name}`);
              return true;
            } else {
              // Regular users: team scope tasks within same team and department
              return (
                effectiveShareScope === 'team' &&
                // Task belongs to same team
                (task.createdBy?.team_id === userTeamId ||
                  task.assignedTo?.team_id === userTeamId) &&
                // Task is in same department/location
                task.department === userDepartment
              );
            }

          case 'department-tasks':
            // "Công việc chung" - Public scope tasks (department-wide)
            if (isUserDirector) {
              // Directors can see ALL tasks (simplified logic)
              console.log(`🔍 Director sees all department tasks: ${task.name}`);
              return true;
            } else {
              // Regular users: public tasks in same department only
              return effectiveShareScope === 'public' && task.department === userDepartment;
            }

          default:
            return false;
        }
      })();

      // Debug log for each task
      if (scope === 'my-tasks' || scope === 'team-tasks' || scope === 'department-tasks') {
        console.log(
          `🔍 Task "${task.name}" (shareScope: ${task.shareScope}) - ${scope}: ${result ? 'INCLUDED' : 'EXCLUDED'}`
        );
      }

      return result;
    });
  }

  // Get filtered tasks for specific view
  async getFilteredTasks(
    scope: 'my-tasks' | 'team-tasks' | 'department-tasks',
    userId?: string
  ): Promise<TaskWithUsers[]> {
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
  private mapDbTaskToTask(
    dbTask: DbTask,
    createdByUser?: any,
    assignedToUser?: any
  ): TaskWithUsers {
    // Debug log để kiểm tra work_type
    console.log(
      '🔍 mapDbTaskToTask - dbTask.work_type:',
      dbTask.work_type,
      'Type:',
      typeof dbTask.work_type,
      'IsArray:',
      Array.isArray(dbTask.work_type)
    );

    // Helper function to normalize work type format
    const normalizeWorkType = (workType: string): string => {
      // Convert underscore to dash format
      return workType.replace(/_/g, '-');
    };

    // Helper function to parse work_type from database
    const parseWorkTypes = (rawWorkType: any): string[] => {
      if (!rawWorkType) return ['other'];

      // Case 1: Already an array
      if (Array.isArray(rawWorkType)) {
        return rawWorkType.map(normalizeWorkType);
      }

      // Case 2: JSON string array like "[\"partner-new\"]"
      if (
        typeof rawWorkType === 'string' &&
        rawWorkType.startsWith('[') &&
        rawWorkType.endsWith(']')
      ) {
        try {
          const parsed = JSON.parse(rawWorkType);
          if (Array.isArray(parsed)) {
            return parsed.map(normalizeWorkType);
          }
        } catch (error) {
          console.warn('Failed to parse work_type JSON:', rawWorkType, error);
        }
      }

      // Case 3: Single string (with underscore format from old data)
      if (typeof rawWorkType === 'string') {
        return [normalizeWorkType(rawWorkType)];
      }

      return ['other'];
    };

    const normalizedWorkTypes = parseWorkTypes(dbTask.work_type);
    console.log('✅ Normalized workTypes:', normalizedWorkTypes);

    return {
      id: dbTask.id,
      name: dbTask.name || '',
      description: dbTask.description || '',
      workType: normalizedWorkTypes[0] as WorkType, // First work type for backward compatibility
      workTypes: normalizedWorkTypes as WorkType[], // Full array
      priority: dbTask.priority as 'low' | 'normal' | 'high',
      status: dbTask.status as 'new-requests' | 'approved' | 'live',
      campaignType: dbTask.campaign_type || '',
      platform: dbTask.platform || [],
      startDate: dbTask.start_date
        ? new Date(dbTask.start_date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : dbTask.created_at
          ? new Date(dbTask.created_at).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : new Date().toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }),
      endDate: dbTask.end_date
        ? new Date(dbTask.end_date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '',
      dueDate: dbTask.due_date
        ? new Date(dbTask.due_date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '',
      createdAt: dbTask.created_at || new Date().toISOString(),
      department: (dbTask.department as 'HN' | 'HCM') || 'HN',
      group: '',
      shareScope: (dbTask.share_scope as 'team' | 'private' | 'public') || 'team',
      createdBy: createdByUser
        ? {
            id: createdByUser.id,
            name: createdByUser.name,
            email: createdByUser.email,
            team_id: createdByUser.team_id,
            location: createdByUser.location,
          }
        : null,
      assignedTo: assignedToUser
        ? {
            id: assignedToUser.id,
            name: assignedToUser.name,
            email: assignedToUser.email,
            team_id: assignedToUser.team_id,
            location: assignedToUser.location,
          }
        : null,
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

      // Get all tasks first
      const allTasks = await this.getTasks();

      // Filter by shareScope using filterTasksByScope
      const filteredTasks = this.filterTasksByScope(allTasks, currentUser.id, 'my-tasks');

      console.log('📅 ShareScope filtering in getMyTasks:', {
        totalTasks: allTasks.length,
        filteredTasks: filteredTasks.length,
        userId: currentUser.id,
        scope: 'my-tasks',
      });

      return filteredTasks;
    } catch (error) {
      console.error('Error in getMyTasks:', error);
      throw error;
    }
  }

  // Get tasks for "Của nhóm" tab with role-based filtering
  async getTeamTasks(teamId?: string, location?: 'HN' | 'HCM'): Promise<TaskWithUsers[]> {
    try {
      const currentUser = getCurrentUser();

      // Get all tasks first
      const allTasks = await this.getTasks();

      // Filter by shareScope using filterTasksByScope
      const filteredTasks = this.filterTasksByScope(allTasks, currentUser.id, 'team-tasks');

      console.log('📅 ShareScope filtering in getTeamTasks:', {
        totalTasks: allTasks.length,
        filteredTasks: filteredTasks.length,
        userId: currentUser.id,
        scope: 'team-tasks',
      });

      return filteredTasks;
    } catch (error) {
      console.error('Error in getTeamTasks:', error);
      throw error;
    }
  }

  // Get tasks for "Công việc chung" tab (department-wide tasks)
  async getDepartmentTasks(location?: 'HN' | 'HCM'): Promise<TaskWithUsers[]> {
    try {
      const currentUser = getCurrentUser();

      // Get all tasks first
      const allTasks = await this.getTasks();

      // Filter by shareScope using filterTasksByScope
      const filteredTasks = this.filterTasksByScope(allTasks, currentUser.id, 'department-tasks');

      console.log('📅 ShareScope filtering in getDepartmentTasks:', {
        totalTasks: allTasks.length,
        filteredTasks: filteredTasks.length,
        userId: currentUser.id,
        scope: 'department-tasks',
      });

      return filteredTasks;
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
        const { data: teams, error } = await supabase.from('teams').select('*').order('name');

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
      dbTasks.map(async dbTask => {
        const [createdByUser, assignedToUser] = await Promise.all([
          this.getUserInfo(dbTask.created_by_id),
          this.getUserInfo(dbTask.assigned_to_id),
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
        name: currentUserName,
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
        name: data.itemTitle, // Clean item name: "Gặp khách hàng"
        description: `Từ: ${parentTaskName}`, // Vietnamese: "Từ: Parent Task Name"
        scheduled_date: data.scheduledDate,
        scheduled_time: data.scheduledTime || null,
        source: 'checklist_item',
        priority: 'medium',
        status: 'new-requests',
        work_type: 'other', // Use 'other' as default
        created_by_id: currentUserId, // ✅ Correct column name
        assigned_to_id: currentUserId, // ✅ Correct column name
        team_id: userDetails?.team_id || null, // Use user's team_id
        department: userDetails?.location || 'unknown', // Use user's location
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
          hint: error.hint,
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
