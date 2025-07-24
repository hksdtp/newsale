import React, { useState, useEffect } from 'react';
import { tasksMockData, TaskGroup, WORK_TYPES } from '../../../data/dashboardMockData';
import CreateTaskModal from '../../../components/CreateTaskModal';
import EditTaskModal from '../../../components/EditTaskModal';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import TaskDetailModal from '../../../components/TaskDetailModal';
import TaskStatusPriority from '../../../components/TaskStatusPriority';
import TaskActions from '../../../components/TaskActions';
import TaskFilters, { FilterState } from '../../../components/TaskFilters';
import { taskService, TaskWithUsers } from '../../../services/taskService';
import { supabase } from '../../../shared/api/supabase';
import { Building, Users, Target, User } from 'lucide-react';
import { getCurrentUser, getUserById, isDirector } from '../../../data/usersMockData';

interface TaskListProps {
  userRole: 'manager' | 'employee';
  currentUser: string;
}

const TaskList: React.FC<TaskListProps> = ({ 
  userRole, 
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState('my-tasks');
  const [departmentTab, setDepartmentTab] = useState<'hanoi' | 'hcm'>('hanoi');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithUsers | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<TaskWithUsers | null>(null);
  const [tasks, setTasks] = useState<TaskWithUsers[]>([]);
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateFilter: 'all',
    workTypeFilter: 'all',
    priorityFilter: 'all'
  });
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
    loadTeamsAndUsers();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const tasksFromDb = await taskService.getTasks();
      setTasks(tasksFromDb);
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback to mock data if database fails
      const allTasks: TaskWithUsers[] = [];
      tasksMockData.forEach(group => {
        group.tasks.forEach(task => {
          allTasks.push({
            ...task,
            createdBy: { id: '1', name: task.createdBy, email: '' },
            assignedTo: task.assignedTo ? { id: '2', name: task.assignedTo, email: '' } : null
          });
        });
      });
      setTasks(allTasks);
    } finally {
      setLoading(false);
    }
  };

  const loadTeamsAndUsers = async () => {
    try {
      const [teamsResponse, usersResponse] = await Promise.all([
        supabase.from('teams').select('*').order('id'),
        supabase.from('users').select('*').order('name')
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
    try {
      setLoading(true);
      const currentUser = getCurrentUser();
      
      await taskService.createTask({
        name: taskData.name,
        description: taskData.description,
        workTypes: taskData.workTypes,
        priority: taskData.priority,
        campaignType: taskData.campaignType,
        platform: taskData.platform,
        startDate: taskData.startDate,
        endDate: taskData.endDate,
        dueDate: taskData.dueDate,
        assignedToId: taskData.assignedTo?.id || null, // Get assignedTo ID from taskData
        department: taskData.department,
        shareScope: taskData.shareScope // Pass the shareScope
      }, currentUser.id);
      
      await loadTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Không thể tạo công việc mới. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
      await taskService.updateTask(taskData);
      await loadTasks();
    } catch (error) {
      console.error('Error updating task:', error);
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
      await taskService.deleteTask(taskToDelete.id);
      await loadTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Không thể xóa công việc. Vui lòng thử lại.');
    } finally {
      setLoading(false);
      setTaskToDelete(null);
    }
  };

  // Filter tasks based on current filters
  const filterTasks = (tasks: TaskWithUsers[], filters: FilterState): TaskWithUsers[] => {
    return tasks.filter(task => {
      // Search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch = 
          task.name.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.createdBy?.name.toLowerCase().includes(searchLower) ||
          task.assignedTo?.name.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Date filter
      if (filters.dateFilter !== 'all') {
        const today = new Date();
        const taskDate = new Date(task.startDate);
        
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
  };

  // Create task groups from filtered tasks
  const createTaskGroups = (filteredTasks: TaskWithUsers[]) => {
    const groups = [
      {
        id: 'new-requests',
        name: 'Chưa tiến hành',
        status: 'new-requests' as const,
        isExpanded: true,
        tasks: filteredTasks.filter(task => task.status === 'new-requests')
      },
      {
        id: 'approved',
        name: 'Đang tiến hành',
        status: 'approved' as const,
        isExpanded: true,
        tasks: filteredTasks.filter(task => task.status === 'approved')
      },
      {
        id: 'live',
        name: 'Đã hoàn thành',
        status: 'live' as const,
        isExpanded: true,
        tasks: filteredTasks.filter(task => task.status === 'live')
      }
    ];
    return groups.filter(group => group.tasks.length > 0);
  };

  // Get tasks based on active tab
  const getFilteredTasks = () => {
    switch (activeTab) {
      case 'my-tasks':
        return tasks.filter(task =>
          task.createdBy?.email === getCurrentUser().email
        );
      case 'team-tasks':
        // For team tasks, get all tasks from the selected location to distribute among teams
        return tasks.filter(task =>
          departmentTab === 'hanoi' ? task.department === 'HN' : task.department === 'HCM'
        );
      case 'department-tasks':
        // For department tasks, show ALL tasks from the department (public tasks)
        return tasks.filter(task => task.shareScope === 'public');
      default:
        return tasks;
    }
  };

  const filteredTasks = filterTasks(getFilteredTasks(), filters);
  const taskGroups = createTaskGroups(filteredTasks);

  // Organize tasks by teams for team-tasks tab
  const organizeTasksByTeams = () => {
    if (activeTab !== 'team-tasks') return [];

    // Get all teams for the selected location (show ALL teams, even without tasks)
    const locationTeams = teams.filter(team => {
      const teamUsers = users.filter(user => user.team_id === team.id.toString());
      return teamUsers.some(user => user.location === (departmentTab === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'));
    });

    return locationTeams.map(team => {
      const teamMembers = users.filter(user =>
        user.team_id === team.id.toString() &&
        user.location === (departmentTab === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh')
      );

      let teamTasks = filteredTasks.filter(task => {
        const assignedUser = users.find(u => u.name === task.assignedTo?.name);
        const createdUser = users.find(u => u.name === task.createdBy?.name);
        return (assignedUser && assignedUser.team_id === team.id.toString()) ||
               (createdUser && createdUser.team_id === team.id.toString());
      });

      // Filter by selected member if any
      if (selectedMemberId) {
        const selectedMember = users.find(u => u.id === selectedMemberId);
        if (selectedMember) {
          teamTasks = teamTasks.filter(task => {
            return task.assignedTo?.name === selectedMember.name ||
                   task.createdBy?.name === selectedMember.name;
          });
        }
      }

      const teamTaskGroups = [
        {
          id: 'new-requests',
          name: 'Chưa tiến hành',
          status: 'new-requests' as const,
          isExpanded: true,
          tasks: teamTasks.filter(task => task.status === 'new-requests')
        },
        {
          id: 'approved',
          name: 'Đang tiến hành',
          status: 'approved' as const,
          isExpanded: true,
          tasks: teamTasks.filter(task => task.status === 'approved')
        },
        {
          id: 'live',
          name: 'Đã hoàn thành',
          status: 'live' as const,
          isExpanded: true,
          tasks: teamTasks.filter(task => task.status === 'live')
        }
      ].filter(group => group.tasks.length > 0);

      return {
        id: team.id.toString(),
        name: team.name,
        members: teamMembers,
        taskGroups: teamTaskGroups,
        totalTasks: teamTasks.length
      };
    }); // Remove filter - show ALL teams even if they have 0 tasks
  };

  const teamGroups = organizeTasksByTeams();

  const workTypeOptions = [
    { value: 'other', label: 'Công việc khác', icon: Building, color: 'bg-gray-500' },
    { value: 'sbg-new', label: 'SBG mới', icon: Building, color: 'bg-blue-500' },
    { value: 'sbg-old', label: 'SBG cũ', icon: Building, color: 'bg-blue-400' },
    { value: 'partner-new', label: 'Đối tác mới', icon: Users, color: 'bg-green-500' },
    { value: 'partner-old', label: 'Đối tác cũ', icon: Users, color: 'bg-green-400' },
    { value: 'kts-new', label: 'KTS mới', icon: Target, color: 'bg-purple-500' },
    { value: 'kts-old', label: 'KTS cũ', icon: Target, color: 'bg-purple-400' },
    { value: 'customer-new', label: 'Khách hàng mới', icon: User, color: 'bg-orange-500' },
    { value: 'customer-old', label: 'Khách hàng cũ', icon: User, color: 'bg-orange-400' }
  ];

  const getWorkTypeInfo = (workType: string) => {
    return workTypeOptions.find(option => option.value === workType) || workTypeOptions[0];
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
    return (
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-6">
        <button
          onClick={() => handleTabChange('my-tasks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'my-tasks'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Của Tôi
        </button>
        <button
          onClick={() => handleTabChange('team-tasks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'team-tasks'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Của Nhóm
        </button>
        <button
          onClick={() => handleTabChange('department-tasks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'department-tasks'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          Công việc chung
        </button>
      </div>
    );
  };

  // Handle department tab change and reset member selection
  const handleDepartmentTabChange = (dept: 'hanoi' | 'hcm') => {
    setDepartmentTab(dept);
    setSelectedMemberId(null); // Reset member selection when changing department
  };

  // Render department tabs when needed
  const renderDepartmentTabs = () => {
    if (activeTab !== 'department-tasks' && activeTab !== 'team-tasks') return null;

    return (
      <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg mb-4">
        <button
          onClick={() => handleDepartmentTabChange('hanoi')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            departmentTab === 'hanoi'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-600'
          }`}
        >
          Hà Nội
        </button>
        <button
          onClick={() => handleDepartmentTabChange('hcm')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            departmentTab === 'hcm'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-600'
          }`}
        >
          Hồ Chí Minh
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      {renderTabs()}
      {renderDepartmentTabs()}

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            disabled={loading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Đang tải...' : 'Tạo công việc mới'}
          </button>
        </div>
      </div>

      {/* Task Filters */}
      <TaskFilters onFilterChange={setFilters} />

      {/* Task Groups */}
      <div className="space-y-4">
        {activeTab === 'team-tasks' ? (
          // Render by teams
          teamGroups.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-gray-400">
                Không có công việc nào cho các nhóm tại {departmentTab === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}
              </div>
            </div>
          ) : (
            teamGroups.map((team) => (
              <div key={team.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Team Header */}
                <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-white">{team.name}</h3>
                      <span className="text-sm text-gray-400">({team.members.length} thành viên)</span>
                      {selectedMemberId && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                          Lọc theo: {users.find(u => u.id === selectedMemberId)?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">{team.totalTasks} công việc</span>
                      {selectedMemberId && team.totalTasks > 0 && (
                        <span className="text-xs text-blue-400">
                          (đã lọc)
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Team Members */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {team.members.map((member) => {
                      const isSelected = selectedMemberId === member.id;
                      const memberTasks = team.taskGroups.reduce((total, group) => {
                        return total + group.tasks.filter(task =>
                          task.assignedTo?.name === member.name || task.createdBy?.name === member.name
                        ).length;
                      }, 0);

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
                            <span className={`ml-1 px-1 py-0.5 rounded text-xs ${
                              isSelected ? 'bg-white/20' : 'bg-black/20'
                            }`}>
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
                    team.taskGroups.map((group) => (
                      <div key={group.id} className="border border-gray-600 rounded-lg overflow-hidden">
                        <div className="bg-gray-700 px-4 py-3 border-b border-gray-600">
                          <h4 className="text-md font-medium text-white">{group.name}</h4>
                          <span className="text-sm text-gray-400">{group.tasks.length} công việc</span>
                        </div>
                        <div className="p-4 space-y-3">
                          {group.tasks.map((task) => {
                            const workTypeInfo = getWorkTypeInfo(task.workType);
                            const WorkTypeIcon = workTypeInfo.icon;
                            return (
                              <div
                                key={task.id}
                                className="bg-gray-600 rounded-lg p-3 hover:bg-gray-500 transition-colors cursor-pointer"
                                onClick={() => handleTaskClick(task)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    {/* Work Type Badge + Title */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium ${workTypeInfo.color}`}>
                                        <WorkTypeIcon className="w-3 h-3" />
                                        {workTypeInfo.label}
                                      </div>
                                      <h5 className="font-medium text-white">{task.name}</h5>
                                    </div>

                                    {task.description && (
                                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{task.description}</p>
                                    )}
                                    <div className="flex items-center space-x-3 text-sm">
                                      <span className="text-gray-400">
                                        Người thực hiện: {task.assignedTo?.name || 'Chưa phân công'}
                                      </span>
                                      <span className="text-gray-400">Ngày: {task.startDate}</span>
                                    </div>
                                    {task.createdBy && (
                                      <div className="text-xs text-gray-400 mt-1">
                                        Người tạo: {task.createdBy.name}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2 ml-4">
                                    <TaskStatusPriority status={task.status} priority={task.priority} />
                                    <TaskActions
                                      onEdit={(e) => {
                                        e.stopPropagation();
                                        handleEditTask(task.id);
                                      }}
                                      onDelete={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task.id);
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          // Render normal task groups
          taskGroups.length === 0 ? (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
              <div className="text-gray-400">
                {tasks.length === 0 ? 'Không có công việc nào' : 'Không tìm thấy công việc phù hợp với bộ lọc'}
              </div>
            </div>
          ) : (
            taskGroups.map((group) => (
              <div key={group.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Group Header */}
                <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{group.name}</h3>
                    <span className="text-sm text-gray-400">{group.tasks.length} công việc</span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="p-6 space-y-3">
                  {group.tasks.map((task) => {
                    const workTypeInfo = getWorkTypeInfo(task.workType);
                    const WorkTypeIcon = workTypeInfo.icon;
                    return (
                      <div
                        key={task.id}
                        className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors cursor-pointer"
                        onClick={() => handleTaskClick(task)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Work Type Badge + Title */}
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-medium ${workTypeInfo.color}`}>
                                <WorkTypeIcon className="w-3 h-3" />
                                {workTypeInfo.label}
                              </div>
                              <h4 className="font-medium text-white">{task.name}</h4>
                            </div>

                            {task.description && (
                              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm">
                              <span className="text-gray-400">
                                Người thực hiện: {task.assignedTo?.name || 'Chưa phân công'}
                              </span>
                              <span className="text-gray-400">Ngày: {task.startDate}</span>
                            </div>
                            {task.createdBy && (
                              <div className="text-xs text-gray-400 mt-1">
                                Người tạo: {task.createdBy.name}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <TaskStatusPriority status={task.status} priority={task.priority} />
                            <TaskActions
                              onEdit={(e) => {
                                e.stopPropagation();
                                handleEditTask(task.id);
                              }}
                              onDelete={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )
        )}
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
      />
    </div>
  );
};

export default TaskList;
