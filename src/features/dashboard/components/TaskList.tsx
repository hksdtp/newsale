import { Building, Target, User, Users } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CreateTaskModal from '../../../components/CreateTaskModal';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import EditTaskModal from '../../../components/EditTaskModal';
import ModernTaskFilters, { FilterState } from '../../../components/ModernTaskFilters';
import MultiWorkTypeBadges from '../../../components/MultiWorkTypeBadges';
import PriorityBadge from '../../../components/PriorityBadge';
import ShareScopeBadge from '../../../components/ShareScopeBadge';
import StatusBadge from '../../../components/StatusBadge';
import TaskActions from '../../../components/TaskActions';
import TaskBadgeGrid from '../../../components/TaskBadgeGrid';
import TaskDetailModal from '../../../components/TaskDetailModal';
import { getCurrentUser } from '../../../data/usersMockData';
import { TaskWithUsers, taskService } from '../../../services/taskService';
import { supabase } from '../../../shared/api/supabase';
import { preflightCheck } from '../../../utils/connectionTest';
import { formatVietnameseDate, parseDate } from '../../../utils/dateUtils';
import {
  getCurrentUserPermissions,
  getDefaultLocationFilter,
  shouldShowLocationTabs,
  shouldShowTeamSelectorButtons,
} from '../../../utils/roleBasedPermissions';
import { clearPermissionCache } from '../../../utils/taskPermissions';

interface TaskListProps {
  userRole: 'manager' | 'employee';
  currentUser: string;
  onModalStateChange?: (isOpen: boolean) => void;
}

const TaskList: React.FC<TaskListProps> = ({ userRole, currentUser, onModalStateChange }) => {
  // All hooks must be called before any early returns
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [departmentTab, setDepartmentTab] = useState<'hanoi' | 'hcm'>('hanoi');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithUsers | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithUsers | null>(null);
  const [tasks, setTasks] = useState<TaskWithUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false); // 🆕 Separate loading state for creating tasks
  const [locationSwitching, setLocationSwitching] = useState(false); // 🚀 Loading state for location switch
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateFilter: 'all',
    workTypeFilter: 'all',
    priorityFilter: 'all',
  });
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // State cho Quick Status Filters
  const [quickStatusFilter, setQuickStatusFilter] = useState<
    'all' | 'new-requests' | 'approved' | 'live'
  >('all');

  // 🔧 FIX: Ref to prevent race conditions when loading tasks
  const loadingRef = useRef(false);

  // 🔧 FIX: Ref to track if departmentTab has been initialized
  const departmentTabInitialized = useRef(false);

  // 🚀 PERFORMANCE: Cache all tasks to avoid reloading from DB
  const allTasksCache = useRef<TaskWithUsers[]>([]);
  const allTasksCacheTime = useRef<number>(0);
  const CACHE_DURATION = 30000; // 30 seconds cache

  // Get current user and permissions with error handling
  const user = (() => {
    try {
      return getCurrentUser();
    } catch (error) {
      console.error('❌ TaskList: Error getting current user:', error);
      // Check if we have auth_user in localStorage
      const authUser = localStorage.getItem('auth_user');
      if (!authUser) {
        console.error('❌ No auth_user found in localStorage - user needs to login');
        // Redirect to login or show error
        window.location.href = '/login';
        return null;
      }

      // Return fallback user data
      return {
        id: 'unknown',
        name: 'Unknown User',
        email: 'unknown@email.com',
        team_id: '0',
        location: 'Hà Nội' as const,
        role: 'employee' as const,
        team: {
          id: '0',
          name: 'Unknown Team',
          location: 'HN' as const,
        },
      };
    }
  })();

  // Update departmentTab based on user location after user is available (only once)
  React.useEffect(() => {
    // 🔧 FIX: Only set departmentTab once on initial load, don't reset when user changes
    if (user && !departmentTabInitialized.current) {
      setDepartmentTab(getDefaultLocationFilter(user));
      departmentTabInitialized.current = true;
      console.log('🏢 Initial departmentTab set to:', getDefaultLocationFilter(user));
    }
  }, [user]);

  // Notify parent about modal state changes
  useEffect(() => {
    const isAnyModalOpen =
      isCreateModalOpen || isEditModalOpen || isDeleteModalOpen || isDetailModalOpen;
    onModalStateChange?.(isAnyModalOpen);
  }, [
    isCreateModalOpen,
    isEditModalOpen,
    isDeleteModalOpen,
    isDetailModalOpen,
    onModalStateChange,
  ]);

  // Load tasks and users when user changes OR when activeTab changes
  useEffect(() => {
    console.log('🔄 useEffect triggered - activeTab:', activeTab, 'user:', user?.name);

    // Only load tasks if user is properly authenticated
    if (user && user.id && user.id !== 'unknown') {
      // 🔧 FIX: Call loadTasks with current activeTab to avoid stale closure
      const loadTasksForCurrentTab = async () => {
        // Prevent race conditions - skip if already loading
        if (loadingRef.current) {
          console.log('⏭️  Skipping loadTasks - already loading');
          return;
        }

        try {
          loadingRef.current = true;
          setLoading(true);

          console.log('🔄 Loading tasks for tab:', activeTab);
          console.log('🔄 Current user:', user?.name, user?.id);
          console.log('🔄 Department tab:', departmentTab);
          console.log('🔄 Selected team ID:', selectedTeamId);

          let tasksFromDb: TaskWithUsers[] = [];

          // Load tasks based on active tab and role-based permissions
          switch (activeTab) {
            case 'my-tasks':
              console.log('📋 Loading my tasks for user ID:', user?.id);
              if (!user?.id) {
                console.error('❌ No user ID found');
                tasksFromDb = [];
              } else {
                tasksFromDb = await taskService.getMyTasks(user.id);
              }
              console.log('📋 My tasks loaded:', tasksFromDb.length, 'tasks');
              break;

            case 'team-tasks':
              const location = departmentTab === 'hanoi' ? 'HN' : 'HCM';
              console.log('👥 Loading team tasks for location:', location, 'team:', selectedTeamId);

              // 🔧 FIX: Director không cần chọn team, tự động thấy TẤT CẢ tasks
              if (user?.role === 'retail_director') {
                console.log('👑 Director mode: Loading ALL tasks (no team filter)');
                tasksFromDb = await taskService.getTeamTasks(undefined, location);
              } else {
                // Regular users: cần chọn team
                tasksFromDb = await taskService.getTeamTasks(selectedTeamId || undefined, location);
              }

              console.log('👥 Team tasks loaded:', tasksFromDb.length, 'tasks');
              break;

            case 'department-tasks':
              const deptLocation = departmentTab === 'hanoi' ? 'HN' : 'HCM';
              console.log('🏢 Loading department tasks for location:', deptLocation);
              tasksFromDb = await taskService.getDepartmentTasks(deptLocation);
              console.log('🏢 Department tasks loaded:', tasksFromDb.length, 'tasks');
              break;

            default:
              console.log('📋 Loading all tasks');
              tasksFromDb = await taskService.getTasks();
              console.log('📋 All tasks loaded:', tasksFromDb.length, 'tasks');
          }

          console.log('🔄 Setting tasks state with:', tasksFromDb.length, 'tasks');
          console.log('🔍 Task IDs:', tasksFromDb.map(t => t.id).slice(0, 5));
          setTasks(tasksFromDb);
          console.log('✅ Tasks state updated successfully');
        } catch (error) {
          console.error('❌ Error loading tasks:', error);
          console.error('❌ Error details:', error);
          setTasks([]);
        } finally {
          setLoading(false);
          loadingRef.current = false;
        }
      };

      loadTasksForCurrentTab();
      loadTeamsAndUsers();
    } else {
      console.warn('⚠️ TaskList: User not authenticated, skipping task load');
      setTasks([]);
    }
  }, [user?.id, activeTab, departmentTab, selectedTeamId]); // 🔧 FIX: Added all dependencies

  // 🔄 Auto-refresh filtered results when filters change
  useEffect(() => {
    console.log('🔍 Filters changed, triggering re-render:', filters);
    // Force re-render by updating a dummy state if needed
    // The filtering happens in render, so this ensures UI updates
  }, [filters, quickStatusFilter]);

  // Early return if user is null (redirecting to login)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Đang chuyển hướng đến trang đăng nhập...</div>
      </div>
    );
  }

  const permissions = getCurrentUserPermissions();

  // Helper function để kiểm tra công việc trong ngày hiện tại
  const isTaskDueToday = (task: TaskWithUsers): boolean => {
    const today = new Date();
    const taskDueDate = task.dueDate ? new Date(task.dueDate) : new Date(task.startDate);

    return (
      taskDueDate.toDateString() === today.toDateString() && task.status !== 'live' // Chỉ highlight công việc chưa hoàn thành
    );
  };

  const loadTasks = async () => {
    // 🔧 FIX: Prevent race conditions - skip if already loading
    if (loadingRef.current) {
      console.log('⏭️  Skipping loadTasks - already loading');
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);

      console.log('🔄 Loading tasks for tab:', activeTab);
      console.log('🔄 Current user:', user?.name, user?.id);
      console.log('🔄 Department tab:', departmentTab);
      console.log('🔄 Selected team ID:', selectedTeamId);

      let tasksFromDb: TaskWithUsers[] = [];

      // Load tasks based on active tab and role-based permissions
      switch (activeTab) {
        case 'my-tasks':
          console.log('📋 Loading my tasks for user ID:', user?.id);
          if (!user?.id) {
            console.error('❌ No user ID found');
            tasksFromDb = [];
          } else {
            tasksFromDb = await taskService.getMyTasks(user.id);
          }
          console.log('📋 My tasks loaded:', tasksFromDb.length, 'tasks');
          break;

        case 'team-tasks':
          const location = departmentTab === 'hanoi' ? 'HN' : 'HCM';
          console.log('👥 Loading team tasks for location:', location, 'team:', selectedTeamId);

          // 🔧 FIX: Director không cần chọn team, tự động thấy TẤT CẢ tasks
          if (user?.role === 'retail_director') {
            console.log('👑 Director mode: Loading ALL tasks (no team filter)');
            tasksFromDb = await taskService.getTeamTasks(undefined, location);
          } else {
            // Regular users: cần chọn team
            tasksFromDb = await taskService.getTeamTasks(selectedTeamId || undefined, location);
          }

          console.log('👥 Team tasks loaded:', tasksFromDb.length, 'tasks');
          break;

        case 'department-tasks':
          const deptLocation = departmentTab === 'hanoi' ? 'HN' : 'HCM';
          console.log('🏢 Loading department tasks for location:', deptLocation);
          tasksFromDb = await taskService.getDepartmentTasks(deptLocation);
          console.log('🏢 Department tasks loaded:', tasksFromDb.length, 'tasks');
          break;

        default:
          console.log('📋 Loading all tasks');
          tasksFromDb = await taskService.getTasks();
          console.log('📋 All tasks loaded:', tasksFromDb.length, 'tasks');
      }

      console.log('🔄 Setting tasks state with:', tasksFromDb.length, 'tasks');
      console.log('🔍 Task IDs:', tasksFromDb.map(t => t.id).slice(0, 5));
      setTasks(tasksFromDb);
      console.log('✅ Tasks state updated successfully');
    } catch (error) {
      console.error('❌ Error loading tasks:', error);
      console.error('❌ Error details:', error);
      setTasks([]);
    } finally {
      setLoading(false);
      loadingRef.current = false; // 🔧 FIX: Reset loading flag
    }
  };

  const loadTeamsAndUsers = async () => {
    try {
      const [teamsResponse, usersResponse] = await Promise.all([
        supabase.from('teams').select('*').order('id'),
        supabase.from('users').select('*').order('name'),
      ]);

      if (teamsResponse.error) throw teamsResponse.error;
      if (usersResponse.error) throw usersResponse.error;

      setTeams(teamsResponse.data || []);
      setUsers(usersResponse.data || []);
    } catch (error) {
      console.error('Error loading teams and users:', error);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    console.log('🚀 handleCreateTask STARTED');
    console.log('📊 Initial createLoading state:', createLoading);

    try {
      console.log('🔄 Setting createLoading to TRUE');
      setCreateLoading(true); // 🔧 Use separate loading state for creating tasks

      // Get current user ID from auth context (more reliable)
      const currentUserId = user?.id;
      if (!currentUserId) {
        console.error('❌ No current user ID found');
        throw new Error('Không tìm thấy thông tin đăng nhập');
      }

      console.log('🎯 Creating task with data:', taskData);
      console.log('🎯 Current tab:', activeTab);
      console.log('🎯 Current user:', user);
      console.log('👤 Current user ID:', currentUserId);

      // Add timeout to prevent hanging
      const createTaskPromise = taskService.createTask(
        {
          name: taskData.name,
          description: taskData.description,
          workTypes: taskData.workTypes,
          priority: taskData.priority,
          campaignType: taskData.campaignType,
          platform: taskData.platform,
          startDate: taskData.startDate,
          endDate: taskData.endDate,
          dueDate: taskData.dueDate,
          assignedToId: taskData.assignedTo?.id || currentUserId,
          department: taskData.department,
          createdAt: taskData.startDate
            ? new Date(taskData.startDate).toISOString()
            : new Date().toISOString(), // Sử dụng startDate làm ngày tạo
          shareScope: taskData.shareScope,
          autoPinToCalendar: taskData.autoPinToCalendar, // 🆕 Fix: Truyền auto-pin option
        },
        currentUserId
      );

      // 🔄 Retry mechanism với timeout tăng dần
      const createTaskWithRetry = async (retries = 3): Promise<any> => {
        for (let attempt = 1; attempt <= retries; attempt++) {
          try {
            console.log(`⏱️ Task creation attempt ${attempt}/${retries}...`);

            // Timeout tăng dần: 15s, 30s, 60s
            const timeoutDuration = attempt * 15000;
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(
                () =>
                  reject(
                    new Error(
                      `Task creation timeout after ${timeoutDuration / 1000} seconds (attempt ${attempt})`
                    )
                  ),
                timeoutDuration
              );
            });

            const result = await Promise.race([createTaskPromise, timeoutPromise]);
            console.log(`✅ Task created successfully on attempt ${attempt}`);
            return result;
          } catch (error) {
            console.error(`❌ Attempt ${attempt} failed:`, error);

            if (attempt === retries) {
              throw error; // Throw on final attempt
            }

            // Wait before retry (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      };

      // 🛫 Preflight check trước khi tạo task
      console.log('🛫 Running preflight check...');
      const isConnectionHealthy = await preflightCheck();

      if (!isConnectionHealthy) {
        throw new Error(
          'Connection check failed. Please check your internet connection and try again.'
        );
      }

      console.log('🔄 Starting task creation with retry mechanism...');
      const newTask = await createTaskWithRetry();

      console.log('✅ Task created successfully:', newTask);
      console.log('🎉 Promise.race completed successfully');

      // Determine which tab should show the new task
      let targetTab = activeTab;

      // If task has tagged users (assigned to others), it might be better shown in team/department tab
      if (taskData.taggedUsers && taskData.taggedUsers.length > 0) {
        // Task assigned to others - could be team or department task
        if (activeTab === 'my-tasks') {
          // If currently on "Của Tôi" but task is assigned to others,
          // still keep it on "Của Tôi" since creator should see their created tasks
          targetTab = 'my-tasks';
        }
      } else {
        // Task not assigned to anyone specific - will be assigned to creator
        // Should definitely show in "Của Tôi"
        targetTab = 'my-tasks';
      }

      // Switch to target tab if different
      if (targetTab !== activeTab) {
        console.log(`🔄 Switching from ${activeTab} to ${targetTab} to show new task`);
        setActiveTab(targetTab);
        // Wait a bit for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Reload tasks to show the new task
      console.log('🔄 About to reload tasks...');
      await loadTasks();
      console.log('✅ Tasks reloaded successfully');

      // Show success message with tab info
      const tabName =
        targetTab === 'my-tasks'
          ? 'Của Tôi'
          : targetTab === 'team-tasks'
            ? 'Của Nhóm'
            : 'Của Phòng Ban';
      // Removed alert for creating task successfully

      console.log('🔄 Tasks reloaded, should be visible in tab:', targetTab);
      console.log('🎉 handleCreateTask SUCCESS - about to exit try block');
    } catch (error) {
      console.error('❌ CATCH BLOCK - Error creating task:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error('❌ Error message:', errorMsg);
      console.error('❌ Error stack:', errorStack);
      console.error('❌ Error type:', typeof error);

      // More specific error messages
      let errorMessage = 'Không thể tạo công việc mới. Vui lòng thử lại.';
      if (errorMsg.includes('timeout')) {
        errorMessage = 'Tạo công việc bị timeout. Vui lòng kiểm tra kết nối và thử lại.';
      } else if (errorMsg.includes('authentication')) {
        errorMessage = 'Lỗi xác thực. Vui lòng đăng nhập lại.';
      } else if (errorMsg.includes('network')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.';
      }

      console.error('❌ About to show alert:', errorMessage);
      alert(errorMessage);
    } finally {
      console.log('🔄 FINALLY BLOCK - Resetting createLoading state...');
      console.log('📊 createLoading before reset:', createLoading);
      setCreateLoading(false); // 🔧 Reset create loading state
      console.log('✅ FINALLY BLOCK - createLoading set to FALSE');
      console.log('🏁 handleCreateTask COMPLETED');
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsEditModalOpen(true);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    try {
      setLoading(true);

      console.log('🔧 Updating task with data:', taskData);

      // Database is now working - update directly in Supabase
      await taskService.updateTask(taskData);

      // Xóa cache permissions khi task được cập nhật (real-time updates)
      clearPermissionCache(taskData.id);

      await loadTasks();

      // Silent update - no success notification needed
    } catch (error) {
      console.error('❌ Error updating task:', error);
      console.error('❌ Task data that failed:', taskData);
      alert('Không thể cập nhật công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;

    try {
      setLoading(true);
      console.log('🗑️ Deleting task:', taskToDelete.id, taskToDelete.name);

      // Database is now working - delete directly from Supabase
      await taskService.deleteTask(taskToDelete.id);
      console.log('✅ Task deleted successfully from database');

      // Xóa cache permissions khi task bị xóa (real-time updates)
      clearPermissionCache(taskToDelete.id);

      // Reload tasks
      console.log('🔄 Reloading tasks after delete...');
      await loadTasks();
      console.log('✅ Tasks reloaded after delete');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      alert('Không thể xóa công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setTaskToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  // Filter tasks based on current filters và quick status filter
  const filterTasks = (tasks: TaskWithUsers[], filters: FilterState): TaskWithUsers[] => {
    const filteredTasks = tasks.filter(task => {
      // Quick Status Filter - ưu tiên cao nhất
      if (quickStatusFilter !== 'all' && task.status !== quickStatusFilter) {
        return false;
      }

      // 🔍 Enhanced Search filter - Tìm kiếm chính xác hơn
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase().trim();

        // Tách từ khóa tìm kiếm để tìm kiếm linh hoạt hơn
        const searchTerms = searchLower.split(/\s+/).filter(term => term.length > 0);

        const searchableText = [
          task.name?.toLowerCase() || '',
          task.description?.toLowerCase() || '',
          task.createdBy?.name?.toLowerCase() || '',
          task.assignedTo?.name?.toLowerCase() || '',
          // Thêm các trường khác có thể tìm kiếm
          task.priority?.toLowerCase() || '',
          task.status?.toLowerCase() || '',
          task.workType?.toLowerCase() || '',
          // Tìm kiếm theo ID task (cho advanced users)
          task.id?.toString() || '',
        ].join(' ');

        // Kiểm tra tất cả từ khóa có xuất hiện không
        const matchesSearch = searchTerms.every(term => searchableText.includes(term));

        if (!matchesSearch) return false;
      }

      // Date range filter - Advanced
      if (filters.customDateRange?.start || filters.customDateRange?.end) {
        const taskDate = new Date(task.startDate || task.createdAt || '');

        if (filters.customDateRange.start) {
          const startDate = new Date(filters.customDateRange.start);
          if (taskDate < startDate) return false;
        }

        if (filters.customDateRange.end) {
          const endDate = new Date(filters.customDateRange.end);
          // Set end date to end of day
          endDate.setHours(23, 59, 59, 999);
          if (taskDate > endDate) return false;
        }
      }

      // Legacy date filter (for backward compatibility)
      if (filters.dateFilter !== 'all') {
        const today = new Date();
        const taskDate = new Date(task.startDate || task.createdAt || '');

        switch (filters.dateFilter) {
          case 'today':
            if (taskDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (taskDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (taskDate < monthAgo) return false;
            break;
        }
      }

      // Work type filter
      if (filters.workTypeFilter !== 'all' && task.workType !== filters.workTypeFilter) {
        return false;
      }

      // Priority filter
      if (filters.priorityFilter !== 'all' && task.priority !== filters.priorityFilter) {
        return false;
      }

      return true;
    });

    // Cải tiến logic sắp xếp: Mới nhất → Đang thực hiện → Chưa thực hiện
    // Ẩn công việc hoàn thành khỏi view mặc định (trừ khi filter "Hoàn thành")
    // TEMPORARILY DISABLED FOR DEBUGGING
    // if (quickStatusFilter === 'all') {
    //   // Ẩn công việc hoàn thành khỏi view mặc định
    //   filteredTasks = filteredTasks.filter(task => task.status !== 'live');
    // }

    // Sắp xếp theo ưu tiên: Mới nhất (theo thời gian tạo) → Đang thực hiện → Chưa thực hiện
    return filteredTasks.sort((a, b) => {
      // Ưu tiên 1: Sắp xếp theo trạng thái
      const statusOrder = { approved: 0, 'new-requests': 1, live: 2 };
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Ưu tiên 2: Trong cùng trạng thái, sắp xếp theo thời gian tạo (mới nhất trước)
      const dateA = new Date(a.createdAt || a.startDate).getTime();
      const dateB = new Date(b.createdAt || b.startDate).getTime();
      return dateB - dateA;
    });
  };

  // Create task groups from filtered tasks
  const createTaskGroups = (filteredTasks: TaskWithUsers[]) => {
    const groups = [
      {
        id: 'new-requests',
        name: 'Chưa tiến hành',
        status: 'new-requests' as const,
        isExpanded: true,
        tasks: filteredTasks.filter(task => task.status === 'new-requests'),
      },
      {
        id: 'approved',
        name: 'Đang tiến hành',
        status: 'approved' as const,
        isExpanded: true,
        tasks: filteredTasks.filter(task => task.status === 'approved'),
      },
      {
        id: 'live',
        name: 'Đã hoàn thành',
        status: 'live' as const,
        isExpanded: true,
        tasks: filteredTasks.filter(task => task.status === 'live'),
      },
    ].sort((a, b) => {
      const order = ['new-requests', 'approved', 'live'];
      return order.indexOf(a.id) - order.indexOf(b.id);
    });
    return groups.filter(group => group.tasks.length > 0);
  };

  // Get tasks based on active tab (tasks are already filtered by role in loadTasks)
  const getFilteredTasks = () => {
    // Tasks are already filtered by role-based permissions in loadTasks()
    // Just return the tasks as they are already properly filtered
    return tasks;
  };

  // 🚀 PERFORMANCE: Memoize filtered tasks to avoid recalculation
  const filteredTasks = useMemo(() => {
    return filterTasks(getFilteredTasks(), filters);
  }, [tasks, filters, quickStatusFilter]);

  // 🚀 PERFORMANCE: Memoize task groups
  const taskGroups = useMemo(() => {
    return createTaskGroups(filteredTasks);
  }, [filteredTasks]);

  // 🔍 DEBUG: Log filtered tasks for Director
  React.useEffect(() => {
    if (user?.role === 'retail_director' && activeTab === 'team-tasks') {
      console.log('🔍 Director filteredTasks debug:', {
        tasksLength: tasks.length,
        filteredTasksLength: filteredTasks.length,
        selectedTeamId: selectedTeamId,
        departmentTab: departmentTab,
        filters: filters,
        quickStatusFilter: quickStatusFilter,
      });
    }
  }, [tasks, filteredTasks, selectedTeamId, departmentTab, activeTab, user?.role]);

  // 🚀 PERFORMANCE: Memoize team groups to avoid recalculation
  const teamGroups = useMemo(() => {
    // Organize tasks by teams for team-tasks tab
    if (activeTab !== 'team-tasks') return [];

    // Get all teams for the selected location (show ALL teams, even without tasks)
    const locationTeams = teams.filter(team => {
      const teamUsers = users.filter(user => user.team_id === team.id.toString());
      return teamUsers.some(
        user => user.location === (departmentTab === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh')
      );
    });

    // Sort teams by their numeric order (extract number from team name)
    const sortedTeams = locationTeams.sort((a, b) => {
      // Extract numbers from team names (e.g., "NHÓM 1" => 1)
      const getTeamNumber = (teamName: string) => {
        const match = teamName.match(/\d+/);
        return match ? parseInt(match[0]) : 999; // Put teams without numbers at the end
      };

      return getTeamNumber(a.name) - getTeamNumber(b.name);
    });

    return sortedTeams.map(team => {
      const teamMembers = users.filter(
        user =>
          user.team_id === team.id.toString() &&
          user.location === (departmentTab === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh')
      );

      // 🔒 SECURITY FIX: Apply team-based filtering
      let teamTasks = filteredTasks.filter(task => {
        const assignedUser = users.find(u => u.name === task.assignedTo?.name);
        const createdUser = users.find(u => u.name === task.createdBy?.name);

        const isTaskFromThisTeam =
          (assignedUser && assignedUser.team_id === team.id.toString()) ||
          (createdUser && createdUser.team_id === team.id.toString());

        // 🔒 SECURITY: Only show tasks if user can view this team
        const canViewThisTeam =
          user.role === 'retail_director' || // Directors can see all teams
          user.team_id === team.id.toString(); // Users can only see their own team

        console.log(`🔒 Team filter for "${task.name}" in team "${team.name}":`, {
          currentUser: user.name,
          currentUserTeam: user.team_id,
          currentUserRole: user.role,
          targetTeam: team.id.toString(),
          isTaskFromThisTeam,
          canViewThisTeam,
          result: isTaskFromThisTeam && canViewThisTeam,
        });

        return isTaskFromThisTeam && canViewThisTeam;
      });

      // Filter by selected member if any
      if (selectedMemberId) {
        const selectedMember = users.find(u => u.id === selectedMemberId);
        console.log('🔍 Member filter debug:', {
          selectedMemberId,
          selectedMember: selectedMember?.name,
          totalTeamTasks: teamTasks.length,
        });

        if (selectedMember) {
          const beforeFilter = teamTasks.length;
          teamTasks = teamTasks.filter(task => {
            const assignedMatch = task.assignedTo?.name === selectedMember.name;
            const createdMatch = task.createdBy?.name === selectedMember.name;
            const result = assignedMatch || createdMatch;

            console.log(`🔍 Task "${task.name}":`, {
              assignedTo: task.assignedTo?.name,
              createdBy: task.createdBy?.name,
              selectedMember: selectedMember.name,
              assignedMatch,
              createdMatch,
              result: result ? 'INCLUDED' : 'EXCLUDED',
            });

            return result;
          });

          console.log(`🔍 Member filter result: ${beforeFilter} -> ${teamTasks.length} tasks`);
        }
      }

      const teamTaskGroups = [
        {
          id: 'new-requests',
          name: 'Chưa tiến hành',
          status: 'new-requests' as const,
          isExpanded: true,
          tasks: teamTasks.filter(task => task.status === 'new-requests'),
        },
        {
          id: 'approved',
          name: 'Đang tiến hành',
          status: 'approved' as const,
          isExpanded: true,
          tasks: teamTasks.filter(task => task.status === 'approved'),
        },
        {
          id: 'live',
          name: 'Đã hoàn thành',
          status: 'live' as const,
          isExpanded: true,
          tasks: teamTasks.filter(task => task.status === 'live'),
        },
      ].filter(group => group.tasks.length > 0);

      return {
        id: team.id.toString(),
        name: team.name,
        members: teamMembers,
        taskGroups: teamTaskGroups,
        totalTasks: teamTasks.length,
      };
    }); // Remove filter - show ALL teams even if they have 0 tasks
  }, [activeTab, teams, users, departmentTab, filteredTasks, selectedMemberId, user]);

  const workTypeOptions = [
    { value: 'other', label: 'Công việc khác', icon: Building, color: 'bg-gray-500' },
    { value: 'sbg-new', label: 'SBG mới', icon: Building, color: 'bg-blue-500' },
    { value: 'sbg-old', label: 'SBG cũ', icon: Building, color: 'bg-blue-400' },
    { value: 'partner-new', label: 'Đối tác mới', icon: Users, color: 'bg-green-500' },
    { value: 'partner-old', label: 'Đối tác cũ', icon: Users, color: 'bg-green-400' },
    { value: 'kts-new', label: 'KTS mới', icon: Target, color: 'bg-purple-500' },
    { value: 'kts-old', label: 'KTS cũ', icon: Target, color: 'bg-purple-400' },
    { value: 'customer-new', label: 'Khách hàng mới', icon: User, color: 'bg-orange-500' },
    { value: 'customer-old', label: 'Khách hàng cũ', icon: User, color: 'bg-orange-400' },
  ];

  const getWorkTypeInfo = (workType: string) => {
    if (!workType) {
      return workTypeOptions[0]; // Default to 'Công việc khác'
    }

    // Handle array string format like "[\"sbg-new\"]"
    let cleanWorkType = workType;
    if (typeof workType === 'string' && workType.startsWith('[') && workType.endsWith(']')) {
      try {
        const parsed = JSON.parse(workType);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cleanWorkType = parsed[0]; // Take first element
        }
      } catch (e) {
        console.warn('Failed to parse workType array string:', workType);
      }
    }

    // Normalize workType - handle potential data inconsistencies
    const normalizedWorkType = cleanWorkType.toString().toLowerCase().trim();

    const found = workTypeOptions.find(
      option =>
        option.value === cleanWorkType ||
        option.value === normalizedWorkType ||
        option.value.toLowerCase() === normalizedWorkType
    );

    // If no match found, log for debugging (but don't spam)
    if (!found) {
      console.warn('⚠️ Unknown workType:', workType, '- Using fallback: Công việc khác');
    }

    return found || workTypeOptions[0];
  };

  // Helper function to get multiple work type info
  const getMultipleWorkTypeInfo = (workTypes: string[] | string | undefined) => {
    if (!workTypes) {
      return [workTypeOptions[0]]; // Default to 'Công việc khác'
    }

    // Handle both array and single string
    const typesArray = Array.isArray(workTypes) ? workTypes : [workTypes];

    return typesArray.map(workType => getWorkTypeInfo(workType));
  };

  const handleTaskClick = (task: TaskWithUsers) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleEditFromDetail = () => {
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleDeleteFromDetail = () => {
    setIsDetailModalOpen(false);
    if (selectedTask) {
      setTaskToDelete(selectedTask);
      setIsDeleteModalOpen(true);
    }
  };

  const handleMemberClick = (memberId: string) => {
    // Toggle member selection - if same member clicked, deselect
    if (selectedMemberId === memberId) {
      setSelectedMemberId(null);
    } else {
      setSelectedMemberId(memberId);
    }
  };

  // Handle tab change and reset member selection
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedMemberId(null); // Reset member selection when changing tabs
  };

  // Render tabs based on user role
  const renderTabs = () => {
    const tabData = [
      { id: 'my-tasks', label: 'Của Tôi' },
      { id: 'team-tasks', label: 'Của Nhóm' },
      { id: 'department-tasks', label: 'Công việc chung' },
    ];

    return (
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* iOS 18 Style Tab Navigation - Mobile Optimized */}
        <nav className="mobile-tab-nav">
          {tabData.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  relative transition-all duration-300
                  ${
                    isActive
                      ? 'text-white bg-gradient-to-r from-cyan-600 to-blue-700 shadow-md'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Enhanced Premium Create Task Button */}
        <button
          disabled={createLoading} // 🔒 Disable button when creating task
          onClick={() => {
            // Prevent click if already creating task
            if (createLoading) return;

            // Add haptic feedback for mobile devices
            if ('vibrate' in navigator) {
              navigator.vibrate(50); // Short vibration
            }

            // Add subtle click sound effect (optional)
            try {
              const audio = new Audio(
                'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
              );
              audio.volume = 0.05;
              audio.play().catch(() => {}); // Ignore errors if audio fails
            } catch (e) {
              // Ignore audio errors
            }

            setIsCreateModalOpen(true);
          }}
          className={`
            premium-create-button
            ${createLoading ? 'premium-loading' : ''}
            group relative overflow-hidden
            flex items-center justify-center gap-3
            px-6 py-3
            border-0
            text-white font-bold
            text-sm
            rounded-2xl
            transition-all duration-500 ease-out
            shadow-2xl hover:shadow-blue-500/30
            transform hover:scale-105 active:scale-95
            w-full lg:w-auto
            min-w-[160px]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            focus:outline-none focus:ring-4 focus:ring-blue-500/50
          `}
        >
          {/* Enhanced Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-cyan-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          {/* Icon with premium animation */}
          <div className="relative z-10 flex items-center justify-center w-5 h-5">
            {createLoading ? (
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="premium-icon w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>

          {/* Text with premium styling */}
          <span className="premium-text relative z-10">
            {createLoading ? 'Đang xử lý...' : 'Tạo công việc'}
          </span>

          {/* Floating particles effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div
              className="absolute top-2 left-4 w-1 h-1 bg-white/60 rounded-full animate-ping"
              style={{ animationDelay: '0s' }}
            ></div>
            <div
              className="absolute top-4 right-6 w-1 h-1 bg-white/40 rounded-full animate-ping"
              style={{ animationDelay: '0.5s' }}
            ></div>
            <div
              className="absolute bottom-3 left-8 w-1 h-1 bg-white/50 rounded-full animate-ping"
              style={{ animationDelay: '1s' }}
            ></div>
            <div
              className="absolute bottom-2 right-4 w-1 h-1 bg-white/30 rounded-full animate-ping"
              style={{ animationDelay: '1.5s' }}
            ></div>
          </div>
        </button>
      </div>
    );
  };

  // Handle department tab change and reset member selection
  const handleDepartmentTabChange = (dept: 'hanoi' | 'hcm') => {
    console.log('🏢 handleDepartmentTabChange called with:', dept);
    console.log('🏢 Current departmentTab:', departmentTab);

    // 🚀 PERFORMANCE: Set loading state immediately for better UX
    setLocationSwitching(true);

    // Update state
    setDepartmentTab(dept);
    setSelectedMemberId(null); // Reset member selection when changing department
    setSelectedTeamId(null); // Reset team selection when changing location

    console.log('🏢 departmentTab will be set to:', dept);

    // Clear loading state after a short delay (will be cleared by useEffect anyway)
    setTimeout(() => {
      setLocationSwitching(false);
    }, 500);
  };

  // Render department tabs when needed (only for directors)
  const renderDepartmentTabs = () => {
    if (activeTab !== 'department-tasks' && activeTab !== 'team-tasks') return null;
    if (!shouldShowLocationTabs(user.role)) return null;

    return (
      <div className="flex items-center gap-2 mt-4">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Khu vực:</span>
        <div className="flex items-center gap-1 p-0.5 bg-gray-900/80 backdrop-blur-md rounded-full shadow">
          <button
            onClick={() => handleDepartmentTabChange('hanoi')}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full
              transition-all duration-300
              ${
                departmentTab === 'hanoi'
                  ? 'text-blue-400 bg-blue-900/50 shadow-inner '
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            Hà Nội
          </button>
          <button
            onClick={() => handleDepartmentTabChange('hcm')}
            className={`
              px-3 py-1.5 text-xs font-medium rounded-full
              transition-all duration-300
              ${
                departmentTab === 'hcm'
                  ? 'text-blue-400 bg-blue-900/50 shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }
            `}
          >
            Hồ Chí Minh
          </button>
        </div>
      </div>
    );
  };

  // Render team selector (only for directors in team-tasks tab)
  const renderTeamSelector = () => {
    // TeamSelector has been removed
    return null;
  };

  return (
    <div className="relative mobile-scroll-container mobile-safe-container">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-50 pointer-events-none" />

      <div className="relative space-y-4 md:space-y-6 mobile-text-optimize">
        {/* Header with Tabs - Mobile Optimized */}
        <div className="mobile-header-container">
          {renderTabs()}
          {renderDepartmentTabs()}
        </div>

        {/* Modern Task Filters - Integrated with Quick Status */}
        <ModernTaskFilters
          onFilterChange={setFilters}
          quickStatusFilter={quickStatusFilter}
          onQuickStatusChange={setQuickStatusFilter}
        />

        {/* Team Selector Buttons for team-tasks tab - Only for directors */}
        {activeTab === 'team-tasks' &&
          teamGroups.length > 0 &&
          shouldShowTeamSelectorButtons(user.role) && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {teamGroups.map(team => {
                  const isSelected = selectedTeamId === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setSelectedTeamId(isSelected ? null : team.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                      }`}
                    >
                      {team.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        {/* Task Groups - Mobile Optimized */}
        <div className="space-y-3 md:space-y-4">
          {/* 🚀 Loading indicator when switching location */}
          {locationSwitching ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="text-gray-400">Đang tải công việc...</div>
              </div>
            </div>
          ) : activeTab === 'team-tasks' ? (
            // Render by teams
            teamGroups.length === 0 ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                <div className="text-gray-400">
                  Không có nhóm nào tại {departmentTab === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}
                </div>
              </div>
            ) : user.role === 'retail_director' && !selectedTeamId ? (
              // 🔧 FIX: Director không chọn team = hiển thị TẤT CẢ tasks (không group theo team)
              <div className="mobile-task-list">
                {filteredTasks.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                    <div className="text-gray-400">Không có công việc nào</div>
                  </div>
                ) : (
                  <div>
                    {filteredTasks.map(task => {
                      const isDueToday = isTaskDueToday(task);
                      return (
                        <div
                          key={task.id}
                          data-testid="task-item"
                          className={`mobile-task-item mobile-touch-feedback mobile-optimized group hover:bg-gray-700/30 transition-all duration-200 cursor-pointer relative ${
                            isDueToday
                              ? 'border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10'
                              : ''
                          }`}
                          onClick={() => handleTaskClick(task)}
                        >
                          {isDueToday && (
                            <div className="absolute top-2 right-2 flex items-center gap-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-red-400 font-medium">Hôm nay</span>
                            </div>
                          )}

                          <div className="hidden md:block w-full mb-3">
                            <TaskBadgeGrid
                              task={task}
                              onUpdateTask={handleUpdateTask}
                              compact={false}
                              maxWorkTypes={2}
                            />
                          </div>

                          <div className="md:hidden w-full mb-3">
                            <TaskBadgeGrid
                              task={task}
                              onUpdateTask={handleUpdateTask}
                              compact={true}
                              maxWorkTypes={1}
                            />
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-medium text-white mb-2 line-clamp-2">
                                {task.name}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                {task.assignedTo && (
                                  <div className="flex items-center gap-1.5">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    <span>{task.assignedTo.name}</span>
                                  </div>
                                )}
                                {task.dueDate && (
                                  <div className="flex items-center gap-1.5">
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                    <span>
                                      {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : selectedTeamId || !shouldShowTeamSelectorButtons(user.role) ? (
              // Show selected team OR user's own team if they can't select teams
              (() => {
                let team;
                if (selectedTeamId) {
                  // Director selected a specific team
                  team = teamGroups.find(team => team.id === selectedTeamId);
                } else if (!shouldShowTeamSelectorButtons(user.role)) {
                  // Non-director user - show their own team
                  team = teamGroups.find(team => team.id === user.team_id);
                }

                if (!team) return null;
                return (
                  <div
                    key={team.id}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                  >
                    {/* Team Header */}
                    <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                          <span className="text-sm text-gray-400">
                            ({team.members.length} thành viên)
                          </span>
                          {selectedMemberId && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                              Lọc theo: {users.find(u => u.id === selectedMemberId)?.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">{team.totalTasks} công việc</span>
                          {selectedMemberId && team.totalTasks > 0 && (
                            <span className="text-xs text-blue-400">(đã lọc)</span>
                          )}
                        </div>
                      </div>
                      {/* Team Members */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {/* Sort members: team leaders first, then others */}
                        {team.members
                          .sort((a, b) => {
                            // Team leaders come first
                            if (a.role === 'team_leader' && b.role !== 'team_leader') return -1;
                            if (a.role !== 'team_leader' && b.role === 'team_leader') return 1;
                            // Then sort alphabetically by name
                            return a.name.localeCompare(b.name);
                          })
                          .map(member => {
                            const isSelected = selectedMemberId === member.id;
                            const memberTasks = team.taskGroups.reduce(
                              (total: number, group: any) => {
                                return (
                                  total +
                                  group.tasks.filter(
                                    (task: any) =>
                                      task.assignedTo?.name === member.name ||
                                      task.createdBy?.name === member.name
                                  ).length
                                );
                              },
                              0
                            );

                            return (
                              <button
                                key={member.id}
                                data-testid="team-member-button"
                                onClick={() => handleMemberClick(member.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                                  isSelected
                                    ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                                    : member.role === 'team_leader'
                                      ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                                      : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                                }`}
                                title={`Click để lọc công việc của ${member.name} (${memberTasks} công việc)`}
                              >
                                {member.name} {member.role === 'team_leader' && '(Trưởng nhóm)'}
                                {memberTasks > 0 && (
                                  <span
                                    className={`ml-1 px-1 py-0.5 rounded text-xs ${
                                      isSelected ? 'bg-white/20' : 'bg-black/20'
                                    }`}
                                  >
                                    {memberTasks}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        {selectedMemberId && (
                          <button
                            onClick={() => setSelectedMemberId(null)}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Xóa bộ lọc thành viên"
                          >
                            ✕ Bỏ lọc
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Team Task Groups */}
                    <div className="p-6 space-y-4">
                      {team.taskGroups.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-400 text-sm">
                            Nhóm này chưa có công việc nào
                          </div>
                        </div>
                      ) : (
                        (() => {
                          // Flatten all tasks from all team groups
                          const allTeamTasks = team.taskGroups.flatMap(group => group.tasks);

                          return (
                            <div className="mobile-task-list">
                              {/* Gmail-Style Team Tasks List - Mobile Optimized */}
                              <div>
                                {allTeamTasks.map(task => {
                                  // Kiểm tra xem có phải công việc trong ngày không
                                  const isDueToday = isTaskDueToday(task);

                                  return (
                                    <div
                                      key={task.id}
                                      className={`mobile-task-item group hover:bg-gray-700/30 transition-all duration-200 cursor-pointer relative ${
                                        isDueToday
                                          ? 'border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10'
                                          : ''
                                      }`}
                                      onClick={() => handleTaskClick(task)}
                                    >
                                      {/* Indicator cho công việc trong ngày */}
                                      {isDueToday && (
                                        <div className="absolute top-2 right-2 flex items-center gap-1">
                                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                          <span className="text-xs text-red-400 font-medium">
                                            Hôm nay
                                          </span>
                                        </div>
                                      )}
                                      {/* Badges Grid - Cải tiến UI/UX với alignment tốt hơn */}
                                      <div className="hidden md:block w-full mb-3">
                                        <TaskBadgeGrid
                                          task={task}
                                          onUpdateTask={handleUpdateTask}
                                          compact={false}
                                          maxWorkTypes={2}
                                        />
                                      </div>

                                      {/* Mobile Badges - Compact layout */}
                                      <div className="md:hidden w-full mb-3">
                                        <TaskBadgeGrid
                                          task={task}
                                          onUpdateTask={handleUpdateTask}
                                          compact={true}
                                          maxWorkTypes={1}
                                        />
                                      </div>

                                      {/* Main Content Area - Mobile Optimized */}
                                      <div className="mobile-task-content">
                                        {/* Desktop/Tablet Layout */}
                                        <div className="hidden md:flex items-center w-full">
                                          <span
                                            className="mobile-assignee"
                                            title={
                                              task.assignedTo?.name ||
                                              task.createdBy?.name ||
                                              'Chưa giao'
                                            }
                                          >
                                            {task.assignedTo?.name ||
                                              task.createdBy?.name ||
                                              'Chưa giao'}
                                          </span>
                                          <h5
                                            className="font-bold text-white group-hover:text-blue-300 transition-colors text-base min-w-0 flex-1 ml-8"
                                            title={task.name}
                                          >
                                            {task.name}
                                            {task.description && (
                                              <span className="text-gray-300 font-normal">
                                                {' - '}
                                                {task.description}
                                              </span>
                                            )}
                                          </h5>
                                        </div>

                                        {/* Mobile Layout - Optimized */}
                                        <div className="md:hidden w-full">
                                          {/* Task Title */}
                                          <h5 className="mobile-task-title" title={task.name}>
                                            {task.name}
                                          </h5>

                                          {/* Task Description */}
                                          {task.description && (
                                            <p
                                              className="mobile-task-description"
                                              title={task.description}
                                            >
                                              {task.description}
                                            </p>
                                          )}

                                          {/* Meta Information */}
                                          <div className="mobile-task-meta">
                                            <MultiWorkTypeBadges
                                              workTypes={task.workTypes || [task.workType]}
                                              onChange={newWorkTypes => {
                                                console.log('WorkTypes changed:', newWorkTypes);
                                                handleUpdateTask({
                                                  id: task.id,
                                                  workTypes: newWorkTypes as any,
                                                });
                                              }}
                                              maxDisplay={2}
                                              className="mobile-task-badge"
                                            />
                                            <StatusBadge
                                              value={task.status}
                                              onChange={(
                                                newStatus: 'new-requests' | 'approved' | 'live'
                                              ) =>
                                                handleUpdateTask({ id: task.id, status: newStatus })
                                              }
                                            />
                                            <PriorityBadge
                                              value={task.priority}
                                              onChange={newPriority =>
                                                handleUpdateTask({
                                                  id: task.id,
                                                  priority: newPriority,
                                                })
                                              }
                                            />
                                            <ShareScopeBadge
                                              value={task.shareScope || 'team'}
                                              onChange={(newScope: 'private' | 'team' | 'public') =>
                                                handleUpdateTask({
                                                  id: task.id,
                                                  shareScope: newScope,
                                                })
                                              }
                                            />
                                            <span
                                              className="mobile-assignee"
                                              title={
                                                task.assignedTo?.name ||
                                                task.createdBy?.name ||
                                                'Chưa giao'
                                              }
                                            >
                                              {task.assignedTo?.name ||
                                                task.createdBy?.name ||
                                                'Chưa giao'}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium">
                                              {(() => {
                                                const dateStr =
                                                  task.startDate || task.createdAt || task.dueDate;
                                                if (dateStr) {
                                                  const date = parseDate(dateStr);
                                                  if (date) {
                                                    return formatVietnameseDate(date);
                                                  }
                                                }
                                                return 'N/A';
                                              })()}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Date - Right aligned like Gmail (Desktop/Tablet only) */}
                                      <div
                                        className="hidden md:block flex-shrink-0 text-xs text-gray-400 font-medium min-w-0"
                                        style={{ width: '60px', textAlign: 'right' }}
                                      >
                                        {(() => {
                                          // Ưu tiên startDate > createdAt > dueDate
                                          const dateStr =
                                            task.startDate || task.createdAt || task.dueDate;
                                          if (dateStr) {
                                            const date = parseDate(dateStr);
                                            if (date) {
                                              return formatVietnameseDate(date);
                                            }
                                          }
                                          return 'N/A';
                                        })()}
                                      </div>

                                      {/* Desktop: Compact actions - Chỉ hiển thị khi hover */}
                                      <div className="hidden md:flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 top-1/2 -translate-y-1/2">
                                        <TaskActions
                                          task={task}
                                          onEdit={e => {
                                            e?.stopPropagation();
                                            handleEditTask(task.id);
                                          }}
                                          onDelete={e => {
                                            e?.stopPropagation();
                                            handleDeleteTask(task.id);
                                          }}
                                          compact
                                        />
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  </div>
                );
              })()
            ) : // No team selected message - Only for directors who can select teams
            shouldShowTeamSelectorButtons(user.role) ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
                <div className="text-gray-400">
                  <div className="mb-2">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium mb-1">Vui lòng chọn một nhóm</p>
                  <p className="text-sm">Chọn nhóm từ các nút ở trên để xem danh sách công việc</p>
                </div>
              </div>
            ) : null
          ) : // Render normal task groups
          taskGroups.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-gray-400">
                {tasks.length === 0
                  ? 'Không có công việc nào'
                  : 'Không tìm thấy công việc phù hợp với bộ lọc'}
              </div>
            </div>
          ) : (
            <div className="mobile-task-list">
              {/* Gmail-Style Tasks List - Mobile Optimized */}
              <div>
                {filteredTasks.map(task => {
                  // Kiểm tra xem có phải công việc trong ngày không
                  const isDueToday = isTaskDueToday(task);

                  return (
                    <div
                      key={task.id}
                      data-testid="task-item"
                      className={`mobile-task-item mobile-touch-feedback mobile-optimized group hover:bg-gray-700/30 transition-all duration-200 cursor-pointer relative ${
                        isDueToday
                          ? 'border-l-4 border-red-500 bg-red-500/5 hover:bg-red-500/10'
                          : ''
                      }`}
                      onClick={() => handleTaskClick(task)}
                    >
                      {/* Indicator cho công việc trong ngày */}
                      {isDueToday && (
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-400 font-medium">Hôm nay</span>
                        </div>
                      )}
                      {/* Badges Grid - Cải tiến UI/UX với alignment tốt hơn */}
                      <div className="hidden md:block w-full mb-3">
                        <TaskBadgeGrid
                          task={task}
                          onUpdateTask={handleUpdateTask}
                          compact={false}
                          maxWorkTypes={2}
                        />
                      </div>

                      {/* Mobile Badges - Compact layout */}
                      <div className="md:hidden w-full mb-3">
                        <TaskBadgeGrid
                          task={task}
                          onUpdateTask={handleUpdateTask}
                          compact={true}
                          maxWorkTypes={1}
                        />
                      </div>

                      {/* Main Content Area - Mobile Optimized */}
                      <div className="mobile-task-content">
                        {/* Desktop/Tablet Layout */}
                        <div className="hidden md:flex items-center w-full">
                          <span
                            className="mobile-assignee"
                            title={task.assignedTo?.name || task.createdBy?.name || 'Chưa giao'}
                          >
                            {task.assignedTo?.name || task.createdBy?.name || 'Chưa giao'}
                          </span>
                          <h5
                            className="font-bold text-white group-hover:text-blue-300 transition-colors text-base min-w-0 flex-1 ml-8"
                            title={task.name + (task.description ? ' - ' + task.description : '')}
                          >
                            {task.name}
                            {task.description && (
                              <span className="text-gray-300 font-normal">
                                {' - '}
                                {task.description.length > 50
                                  ? task.description.substring(0, 50) + '...'
                                  : task.description}
                              </span>
                            )}
                          </h5>
                        </div>

                        {/* Mobile Layout - Optimized */}
                        <div className="md:hidden w-full">
                          {/* Task Title */}
                          <h5 className="mobile-task-title" title={task.name}>
                            {task.name}
                          </h5>

                          {/* Task Description */}
                          {task.description && (
                            <p className="mobile-task-description" title={task.description}>
                              {task.description.length > 80
                                ? task.description.substring(0, 80) + '...'
                                : task.description}
                            </p>
                          )}

                          {/* Meta Information */}
                          <div className="mobile-task-meta">
                            <MultiWorkTypeBadges
                              workTypes={task.workTypes || [task.workType]}
                              onChange={newWorkTypes => {
                                console.log('WorkTypes changed:', newWorkTypes);
                                handleUpdateTask({
                                  id: task.id,
                                  workTypes: newWorkTypes as any,
                                });
                              }}
                              maxDisplay={2}
                              className="mobile-task-badge"
                            />
                            <StatusBadge
                              value={task.status}
                              onChange={(newStatus: 'new-requests' | 'approved' | 'live') =>
                                handleUpdateTask({ id: task.id, status: newStatus })
                              }
                            />
                            <PriorityBadge
                              value={task.priority}
                              onChange={(newPriority: 'low' | 'normal' | 'high') =>
                                handleUpdateTask({ id: task.id, priority: newPriority })
                              }
                            />
                            <ShareScopeBadge
                              value={task.shareScope || 'team'}
                              onChange={(newScope: 'private' | 'team' | 'public') =>
                                handleUpdateTask({ id: task.id, shareScope: newScope })
                              }
                            />
                            <span
                              className="mobile-assignee"
                              title={task.assignedTo?.name || task.createdBy?.name || 'Chưa giao'}
                            >
                              {task.assignedTo?.name || task.createdBy?.name || 'Chưa giao'}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {(() => {
                                const dateStr = task.startDate || task.createdAt || task.dueDate;
                                if (dateStr) {
                                  const date = parseDate(dateStr);
                                  if (date) {
                                    return formatVietnameseDate(date);
                                  }
                                }
                                return 'N/A';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Date - Right aligned like Gmail (Desktop/Tablet only) */}
                      <div
                        className="hidden md:block flex-shrink-0 text-xs text-gray-400 font-medium min-w-0"
                        style={{ width: '60px', textAlign: 'right' }}
                      >
                        {(() => {
                          // Ưu tiên startDate > createdAt > dueDate
                          const dateStr = task.startDate || task.createdAt || task.dueDate;
                          if (dateStr) {
                            const date = parseDate(dateStr);
                            if (date) {
                              return formatVietnameseDate(date);
                            }
                          }
                          return 'N/A';
                        })()}
                      </div>

                      {/* Desktop: Compact actions - Chỉ hiển thị khi hover */}
                      <div className="hidden md:flex flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute right-4 top-1/2 -translate-y-1/2">
                        <TaskActions
                          task={task}
                          onEdit={e => {
                            e?.stopPropagation();
                            handleEditTask(task.id);
                          }}
                          onDelete={e => {
                            e?.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                          compact
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        task={selectedTask}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={confirmDeleteTask}
        title="Xóa công việc"
        message="Bạn có chắc chắn muốn xóa công việc này vĩnh viễn?"
        itemName={taskToDelete?.name}
      />

      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
        onUpdate={handleUpdateTask}
      />
    </div>
  );
};

export default TaskList;
