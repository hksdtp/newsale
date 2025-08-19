import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  User,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import TaskDetailModal from '../../../components/TaskDetailModal';
import { getCurrentUser } from '../../../data/usersMockData';
import { schedulingService } from '../../../services/schedulingService';
import { taskService, TaskWithUsers } from '../../../services/taskService';
import { teamsService } from '../../../services/teamsService';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  location: string;
}

function PlanningTab() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<TaskWithUsers[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Task Detail Modal states
  const [selectedTask, setSelectedTask] = useState<TaskWithUsers | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);

  // Check if user can view team schedules
  const canViewTeamSchedules =
    currentUser &&
    (currentUser.name === 'Khổng Đức Mạnh' ||
      currentUser.role === 'team_leader' ||
      currentUser.role === 'retail_director');

  // Load current user and team data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const user = getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setSelectedUserId(user.id); // Default to current user

          // Load team members if user has permission
          if (
            user.name === 'Khổng Đức Mạnh' ||
            user.role === 'team_leader' ||
            user.role === 'retail_director'
          ) {
            await loadTeamMembers(user.team_id);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Load team members
  const loadTeamMembers = async (teamId: string) => {
    try {
      if (!teamId) return;

      const members = await teamsService.getTeamMembers(teamId);
      setTeamMembers(members || []);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  // Load scheduled tasks for selected user and date
  const loadScheduledTasks = async () => {
    if (!selectedUserId || !selectedDate) return;

    try {
      const tasks = await schedulingService.getScheduledTasksForDate(selectedDate, selectedUserId);
      setScheduledTasks(tasks || []);
    } catch (error) {
      console.error('Error loading scheduled tasks:', error);
      setScheduledTasks([]);
    }
  };

  useEffect(() => {
    loadScheduledTasks();
  }, [selectedUserId, selectedDate]);

  // Get selected user info
  const getSelectedUserInfo = () => {
    if (!selectedUserId) return { name: 'Tất cả thành viên', role: '' };
    if (selectedUserId === currentUser?.id)
      return { name: 'Công việc của tôi', role: currentUser?.role || '' };

    const member = teamMembers.find(m => m.id === selectedUserId);
    return member ? { name: member.name, role: member.role } : { name: 'Không xác định', role: '' };
  };

  // Get task status info
  const getTaskStatusInfo = (status: string) => {
    switch (status) {
      case 'new-requests':
        return { label: 'Chưa tiến hành', color: 'bg-yellow-500', icon: Clock };
      case 'approved':
        return { label: 'Đang tiến hành', color: 'bg-blue-500', icon: AlertTriangle };
      case 'live':
        return { label: 'Đã hoàn thành', color: 'bg-green-500', icon: CheckCircle };
      default:
        return { label: status, color: 'bg-gray-500', icon: Clock };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Đang tải kế hoạch...</span>
      </div>
    );
  }

  // Task Detail Modal handlers
  const handleTaskClick = (task: TaskWithUsers) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleTaskDetailClose = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

  const handleTaskUpdate = async (taskData: TaskWithUsers) => {
    try {
      await taskService.updateTask(taskData);
      // Reload tasks to show updated data
      await loadScheduledTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Không thể cập nhật công việc. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">Kế Hoạch Công Việc</h3>
            <p className="text-gray-400 text-sm">Quản lý và theo dõi lịch trình công việc</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Picker */}
        <div>
          <label className="block text-white font-medium mb-2">Chọn ngày</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* User Selector - Only show for authorized users */}
        {canViewTeamSchedules && (
          <div>
            <label className="block text-white font-medium mb-2">Xem công việc của</label>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{getSelectedUserInfo().name}</span>
                  {getSelectedUserInfo().role && (
                    <span className="text-gray-400 text-sm">({getSelectedUserInfo().role})</span>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div
                    onClick={() => {
                      setSelectedUserId('');
                      setIsDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-white">Tất cả thành viên</span>
                  </div>
                  <div
                    onClick={() => {
                      setSelectedUserId(currentUser.id);
                      setIsDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-white">Công việc của tôi</span>
                  </div>
                  {teamMembers.map(member => (
                    <div
                      key={member.id}
                      onClick={() => {
                        setSelectedUserId(member.id);
                        setIsDropdownOpen(false);
                      }}
                      className="p-3 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      <div>
                        <span className="text-white">{member.name}</span>
                        <span className="text-gray-400 text-sm ml-2">({member.role})</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tasks Display */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-600/50">
        <div className="p-4 border-b border-gray-600/50">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-white">
              Công việc ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
            </h4>
            <span className="text-gray-400 text-sm">{scheduledTasks.length} công việc</span>
          </div>
        </div>

        <div className="p-4">
          {scheduledTasks.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">
                {selectedUserId
                  ? `${getSelectedUserInfo().name} không có công việc nào trong ngày này`
                  : 'Không có công việc nào trong ngày này'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scheduledTasks.map(task => {
                const statusInfo = getTaskStatusInfo(task.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={task.id}
                    className="bg-gray-700/50 rounded-lg p-4 border border-gray-600/30 hover:border-gray-500/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${statusInfo.color}`}></div>
                          <h5 className="text-white font-medium truncate">{task.name}</h5>
                        </div>

                        {task.description && (
                          <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusInfo.label}</span>
                          </div>

                          {task.createdBy && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>Tạo bởi: {task.createdBy.name}</span>
                            </div>
                          )}

                          {task.assignedTo && task.assignedTo.id !== task.createdBy?.id && (
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>Giao cho: {task.assignedTo.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        {task.workTypes && task.workTypes.length > 0 && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full">
                            {task.workTypes[0]}
                          </span>
                        )}

                        {task.priority && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              task.priority === 'high'
                                ? 'bg-red-500/20 text-red-300'
                                : task.priority === 'normal'
                                  ? 'bg-yellow-500/20 text-yellow-300'
                                  : 'bg-green-500/20 text-green-300'
                            }`}
                          >
                            {task.priority === 'high'
                              ? 'Cao'
                              : task.priority === 'normal'
                                ? 'Bình thường'
                                : 'Thấp'}
                          </span>
                        )}

                        {/* View Detail Button */}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleTaskClick(task);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Xem chi tiết công việc"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskDetailOpen}
        onClose={handleTaskDetailClose}
        task={selectedTask}
        onEdit={() => {
          // Close detail modal and open edit modal in TaskList
          handleTaskDetailClose();
          // Note: In a real implementation, you might want to navigate to TaskList
          // or implement edit functionality here
        }}
        onDelete={() => {
          // Handle delete - could implement here or navigate to TaskList
          handleTaskDetailClose();
        }}
        onUpdate={handleTaskUpdate}
      />
    </div>
  );
}

export default PlanningTab;
