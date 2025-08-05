import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Circle, Plus, ArrowRight, CalendarDays, Target, Trash2, Edit3, MoreVertical, ChevronLeft, ChevronRight, Users, Eye, Grid3X3 } from 'lucide-react';
import { schedulingService, ScheduledTask } from '../../../services/schedulingService';
import { taskService } from '../../../services/taskService';
import { supabase } from '../../../shared/api/supabase';
import { getCurrentUser } from '../../../data/usersMockData';
import { WeeklyScheduleManager } from './WeeklyScheduleManager';

export function PlanningTab() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [dailyTasks, setDailyTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // User permissions and selection
  const currentUser = getCurrentUser();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  // Check if current user is Khổng Đức Mạnh (can view all schedules)
  const canViewAllSchedules = currentUser?.name === 'Khổng Đức Mạnh' || currentUser?.email === 'manh.khong@company.com';

  // Weekly schedule manager state
  const [showWeeklySchedule, setShowWeeklySchedule] = useState(false);

  // Debug: Log initial state
  console.log('📅 PlanningTab: Initial state:', {
    selectedDate: selectedDate.toISOString().split('T')[0],
    currentMonth: currentMonth.toISOString().split('T')[0],
    scheduledTasksCount: scheduledTasks.length
  });

  // Load users if current user can view all schedules
  useEffect(() => {
    if (canViewAllSchedules) {
      loadUsers();
    }
  }, [canViewAllSchedules]);

  // Load scheduled tasks for current month
  useEffect(() => {
    console.log('📅 PlanningTab: Loading tasks for month:', currentMonth.toISOString().split('T')[0]);
    loadMonthlyTasks();
  }, [currentMonth, selectedUserId]);

  // Load daily tasks when date changes
  useEffect(() => {
    loadDailyTasks();
  }, [selectedDate, selectedUserId]);

  // Load users for admin view
  const loadUsers = async () => {
    try {
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, name, email, role, location')
        .order('name');

      if (error) throw error;
      setUsers(usersData || []);
      console.log('👥 Loaded users for admin view:', usersData?.length || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMonthlyTasks = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log('📅 PlanningTab: Loading monthly tasks for range:', {
        month: currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
        startDate: startDateStr,
        endDate: endDateStr
      });

      // If admin viewing specific user, filter by user
      let tasks;
      if (canViewAllSchedules && selectedUserId) {
        // Load tasks for specific user in date range
        tasks = await schedulingService.getScheduledTasksInRange(startDateStr, endDateStr, selectedUserId);
        console.log(`📅 PlanningTab: Loaded tasks for user ${selectedUserId}:`, tasks?.length || 0);
      } else if (canViewAllSchedules && !selectedUserId) {
        // Load all tasks for admin in date range
        tasks = await schedulingService.getScheduledTasksInRange(startDateStr, endDateStr);
        console.log('📅 PlanningTab: Loaded all tasks for admin:', tasks?.length || 0);
      } else {
        // Load only current user's tasks in date range
        tasks = await schedulingService.getScheduledTasksInRange(startDateStr, endDateStr);
        console.log('📅 PlanningTab: Loaded current user tasks:', tasks?.length || 0);
      }

      console.log('📅 PlanningTab: Loaded monthly tasks:', tasks?.length || 0);
      if (tasks && tasks.length > 0) {
        console.log('📋 Monthly tasks:', tasks.map(t => ({
          name: t.name || t.title,
          date: t.scheduled_date,
          time: t.scheduled_time
        })));
      } else {
        console.log('📋 No monthly tasks found for range:', startDateStr, 'to', endDateStr);
      }

      setScheduledTasks(tasks);
    } catch (error) {
      console.error('❌ Error loading monthly tasks:', error);

      // Show user-friendly error
      if (error.message?.includes('Failed to fetch')) {
        console.error('🌐 Network error - check internet connection');
        alert('❌ Lỗi mạng: Không thể tải dữ liệu. Vui lòng kiểm tra kết nối internet và thử lại.');
      } else {
        console.error('🔧 API error:', error.message);
        alert('❌ Lỗi: ' + (error.message || 'Không thể tải dữ liệu kế hoạch'));
      }

      // Set empty array on error
      setScheduledTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDailyTasks = async () => {
    try {
      // Use local date string to avoid timezone issues
      const localDateStr = selectedDate.getFullYear() + '-' +
        String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
        String(selectedDate.getDate()).padStart(2, '0');

      console.log('📅 PlanningTab: Loading daily tasks for local date:', {
        selectedDate: selectedDate.toLocaleDateString('vi-VN'),
        localDateStr: localDateStr,
        isoWouldBe: selectedDate.toISOString().split('T')[0]
      });

      // Apply user filtering for daily tasks too
      const tasks = await schedulingService.getScheduledTasks(localDateStr, selectedUserId || undefined);

      console.log('📅 PlanningTab: Loaded daily tasks for', localDateStr, ':', tasks?.length || 0);
      if (tasks && tasks.length > 0) {
        console.log('📋 Daily tasks:', tasks.map(t => ({
          name: t.name || t.title,
          time: t.scheduled_time,
          scheduled_date: t.scheduled_date
        })));
      }

      setDailyTasks(tasks);
    } catch (error) {
      console.error('Error loading daily tasks:', error);
    }
  };

  const getTasksForDate = (date: Date) => {
    // Use local date string to avoid timezone issues
    const localDateStr = date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');

    console.log('🔍 PlanningTab: Getting tasks for date:', {
      inputDate: date.toLocaleDateString('vi-VN'),
      localString: localDateStr,
      tasksToCheck: scheduledTasks.map(t => ({
        name: t.name,
        scheduled_date: t.scheduled_date,
        dateOnly: t.scheduled_date?.split('T')[0]
      }))
    });

    const matchingTasks = scheduledTasks.filter(task => {
      if (!task.scheduled_date) return false;

      // Extract date part only (remove time and timezone)
      const taskDateOnly = task.scheduled_date.split('T')[0];
      const matches = taskDateOnly === localDateStr;

      if (matches) {
        console.log('✅ Task matches date:', {
          taskName: task.name,
          taskDate: taskDateOnly,
          searchDate: localDateStr
        });
      }

      return matches;
    });

    console.log('🎯 Found matching tasks:', matchingTasks.length);

    return matchingTasks;
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5); // HH:MM
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const moveTaskToToday = async (taskId: string) => {
    try {
      await taskService.updateTask({
        id: taskId,
        source: 'scheduled'
      });

      // Refresh data
      await loadMonthlyTasks();
      await loadDailyTasks();

      alert('✅ Công việc đã được chuyển về danh sách công việc hôm nay!');
    } catch (error) {
      console.error('Error moving task:', error);
      alert('❌ Không thể chuyển công việc. Vui lòng thử lại.');
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    if (!confirm('🗑️ Bạn có chắc chắn muốn xóa công việc này?')) {
      return;
    }

    try {
      setDeletingTaskId(taskId);
      await taskService.deleteTask(taskId);

      // Refresh data
      await loadMonthlyTasks();
      await loadDailyTasks();

      setActiveDropdown(null);
      alert('✅ Công việc đã được xóa thành công!');
    } catch (error) {
      console.error('❌ Error deleting task:', error);
      alert('❌ Không thể xóa công việc. Vui lòng thử lại.');
    } finally {
      setDeletingTaskId(null);
    }
  };

  // Toggle dropdown menu
  const toggleDropdown = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setActiveDropdown(activeDropdown === taskId ? null : taskId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-full bg-gray-900 text-white">
      {/* Header - Responsive */}
      <div className="p-3 sm:p-6 border-b border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-blue-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Kế Hoạch</h1>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            {/* User Selector for Admin */}
            {canViewAllSchedules && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <select
                  value={selectedUserId || ''}
                  onChange={(e) => setSelectedUserId(e.target.value || null)}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-purple-400 focus:outline-none"
                >
                  <option value="">Tất cả nhân viên</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.location})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-400">
                <span className="hidden sm:inline">
                  {scheduledTasks.length} công việc đã lên lịch
                  {canViewAllSchedules && selectedUserId && (
                    <span className="text-purple-400 ml-1">
                      ({users.find(u => u.id === selectedUserId)?.name})
                    </span>
                  )}
                </span>
                <span className="sm:hidden">{scheduledTasks.length} việc</span>
              </div>

              {/* Weekly Schedule Manager Button - Only for Admin */}
              {canViewAllSchedules && (
                <button
                  onClick={() => setShowWeeklySchedule(true)}
                  className="px-2 sm:px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs hover:bg-green-500/30 transition-colors flex items-center gap-1"
                >
                  <Grid3X3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Lịch Showroom</span>
                  <span className="sm:hidden">Lịch</span>
                </button>
              )}

              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  loadMonthlyTasks();
                  loadDailyTasks();
                }}
                className="px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
              >
                <span className="hidden sm:inline">🔄 Refresh</span>
                <span className="sm:hidden">🔄</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Panel - Calendar - Responsive */}
        <div className="w-full lg:w-1/2 p-3 sm:p-6 lg:border-r border-gray-700">
          <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-6">
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
              <span className="hidden sm:inline">Lịch Tháng</span>
              <span className="sm:hidden">Lịch</span>
            </h2>

            {/* Custom Calendar */}
            <div className="space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  ←
                </button>

                <h3 className="text-lg font-medium">
                  {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                </h3>

                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  →
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-400">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {Array.from({ length: 42 }, (_, i) => {
                  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                  const startOfCalendar = new Date(startOfMonth);
                  startOfCalendar.setDate(startOfCalendar.getDate() - startOfMonth.getDay());

                  const currentDate = new Date(startOfCalendar);
                  currentDate.setDate(currentDate.getDate() + i);

                  const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
                  const isSelected = currentDate.toDateString() === selectedDate.toDateString();
                  const tasksForDate = getTasksForDate(currentDate);
                  const isCurrentDay = isToday(currentDate);

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(currentDate)}
                      className={`
                        p-2 text-sm rounded-lg transition-all relative
                        ${isSelected ? 'bg-blue-500 text-white' : ''}
                        ${isCurrentDay && !isSelected ? 'bg-green-500/20 text-green-400' : ''}
                        ${!isCurrentMonth ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-700'}
                        ${tasksForDate.length > 0 ? 'font-medium' : ''}
                      `}
                    >
                      {currentDate.getDate()}
                      {tasksForDate.length > 0 && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 bg-blue-400 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Daily Tasks - Responsive */}
        <div className="w-full lg:w-1/2 p-3 sm:p-6">
          <div className="bg-gray-800/50 rounded-xl sm:rounded-2xl p-3 sm:p-6 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                <Target className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                <span className="hidden sm:inline">
                  Công việc ngày {selectedDate.toLocaleDateString('vi-VN')}
                </span>
                <span className="sm:hidden">
                  {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                </span>
              </h2>

              <div className="flex items-center gap-2">
                {isToday(selectedDate) && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                    Hôm nay
                  </span>
                )}

                {dailyTasks.length > 0 && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    {dailyTasks.length} việc
                  </span>
                )}
              </div>
            </div>

            {/* Daily Tasks List - Responsive */}
            <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {dailyTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">Không có công việc nào</p>
                  <p className="text-sm text-gray-500">
                    {isToday(selectedDate)
                      ? 'Hôm nay bạn không có công việc nào được lên lịch'
                      : 'Ngày này chưa có công việc nào được lên lịch'
                    }
                  </p>
                </div>
              ) : (
                dailyTasks.map(task => (
                  <div
                    key={task.id}
                    className={`
                      relative p-3 sm:p-4 rounded-xl border transition-all group
                      ${isPastDate(selectedDate)
                        ? 'bg-gray-800/40 border-gray-600/50'
                        : 'bg-white/5 border-gray-700/50 hover:bg-white/10 hover:border-gray-600'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-medium text-white text-sm sm:text-base leading-tight">
                            {task.title || task.name}
                          </h3>

                          {/* Mobile-first action menu */}
                          <div className="relative flex-shrink-0">
                            <button
                              onClick={(e) => toggleDropdown(task.id, e)}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                              title="Tùy chọn"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown menu */}
                            {activeDropdown === task.id && (
                              <div className="absolute right-0 top-8 z-10 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1">
                                {isToday(selectedDate) && task.source !== 'scheduled' && (
                                  <button
                                    onClick={() => moveTaskToToday(task.id)}
                                    className="w-full px-3 py-2 text-left text-sm text-blue-400 hover:bg-gray-700/50 flex items-center gap-2"
                                  >
                                    <ArrowRight className="w-4 h-4" />
                                    Chuyển về hôm nay
                                  </button>
                                )}

                                <button
                                  onClick={() => deleteTask(task.id)}
                                  disabled={deletingTaskId === task.id}
                                  className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700/50 flex items-center gap-2 disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  {deletingTaskId === task.id ? 'Đang xóa...' : 'Xóa công việc'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Tags and info - responsive layout */}
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {task.scheduled_time && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-700/50 rounded-full">
                              <Clock className="w-3 h-3" />
                              <span className="hidden sm:inline">
                                {formatTime(task.scheduled_time)}
                              </span>
                              <span className="sm:hidden">
                                {formatTime(task.scheduled_time).split(':')[0]}:{formatTime(task.scheduled_time).split(':')[1]}
                              </span>
                            </div>
                          )}

                          <div className={`px-2 py-1 rounded-full text-xs ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {task.priority === 'high' ? 'Cao' :
                             task.priority === 'medium' ? 'TB' : 'Thấp'}
                          </div>

                          {task.source === 'scheduled' && (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span className="hidden sm:inline">Đã chuyển</span>
                              <span className="sm:hidden">✓</span>
                            </div>
                          )}

                          {task.source === 'checklist_item' && (
                            <div className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                              <span className="hidden sm:inline">Checklist</span>
                              <span className="sm:hidden">☑</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Stats */}
            {dailyTasks.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-400">
                      {dailyTasks.length}
                    </div>
                    <div className="text-xs text-gray-500">Tổng số</div>
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-green-400">
                      {dailyTasks.filter(t => t.source === 'scheduled').length}
                    </div>
                    <div className="text-xs text-gray-500">Đã chuyển</div>
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-yellow-400">
                      {dailyTasks.filter(t => t.priority === 'high').length}
                    </div>
                    <div className="text-xs text-gray-500">Ưu tiên cao</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Schedule Manager Modal */}
      {showWeeklySchedule && (
        <WeeklyScheduleManager onClose={() => setShowWeeklySchedule(false)} />
      )}
    </div>
  );
}
