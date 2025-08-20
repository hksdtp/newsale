import {
  ArrowRight,
  Building,
  Calendar,
  Edit3,
  Plus,
  Save,
  Target,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '../data/usersMockData';
import { TaskAttachment } from '../services/attachmentService';
import { ChecklistProgress } from '../services/checklistService';
import { Employee, employeeService } from '../services/employeeService';
import { TaskWithUsers } from '../services/taskService';
import IOSDatePicker from './IOSDatePicker';
import RichTextDisplay from './RichTextDisplay';
import RichTextEditor from './RichTextEditor';
import StatusPriorityEditor from './StatusPriorityEditor';
import TaskAttachments from './TaskAttachments';
import TaskChecklist from './TaskChecklist';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithUsers | null;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate?: (taskData: TaskWithUsers) => void; // New prop for inline updates
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onDelete,
  onUpdate,
}) => {
  // State for new features
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({
    total: 0,
    completed: 0,
    percentage: 0,
  });
  const [isScheduled, setIsScheduled] = useState(false);

  // State for inline editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    status: 'new-requests' as 'new-requests' | 'approved' | 'live',
    startDate: '',
    dueDate: '',
    assignedUsers: [] as string[],
  });

  // State for date pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // State for move task to different date
  const [showMoveDatePicker, setShowMoveDatePicker] = useState(false);
  const [moveToDate, setMoveToDate] = useState('');

  // State for user tagging - Sử dụng dữ liệu thực từ database
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<Employee[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load available users từ database - Sử dụng API thật
  const loadAvailableUsers = async () => {
    try {
      setLoadingUsers(true);
      const currentUser = getCurrentUser();
      if (!currentUser) {
        console.warn('No current user found');
        return;
      }

      console.log('🔍 Loading users for current user:', currentUser.name, currentUser.role);

      // Lấy tất cả users từ database
      const allUsers = await employeeService.getAllEmployees();
      console.log('📋 All users from database:', allUsers.length);

      // Filter để chỉ hiển thị users phù hợp theo role
      const filteredUsers = allUsers.filter(user => {
        // Luôn bao gồm current user
        if (user.id === currentUser.id) return true;

        // Nếu là director, có thể thấy tất cả users trong location
        if (currentUser.role === 'retail_director') {
          return user.location === currentUser.location;
        }

        // Team leader có thể thấy members trong team
        if (currentUser.role === 'team_leader') {
          return user.team_id === currentUser.team_id && user.location === currentUser.location;
        }

        // Employee chỉ thấy members trong cùng team
        return user.team_id === currentUser.team_id && user.location === currentUser.location;
      });

      console.log('✅ Filtered users for assignment:', filteredUsers.length);
      setAvailableUsers(filteredUsers);
    } catch (error) {
      console.error('❌ Error loading available users:', error);
      // Fallback to empty array instead of mock data
      setAvailableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load task data when modal opens or task changes
  useEffect(() => {
    if (task) {
      // Đảm bảo format ngày đúng cho date picker
      const formatDateForPicker = (dateString: string) => {
        if (!dateString) return '';

        const date = parseVietnameseDate(dateString);
        if (!date) {
          console.warn('Could not parse date for picker:', dateString);
          return '';
        }

        return date.toISOString().split('T')[0];
      };

      // Logic ngày mặc định:
      // - Ngày bắt đầu = ngày tạo công việc (task.createdAt hoặc task.startDate)
      // - Hạn chót = do user tự chọn (task.dueDate)
      const defaultStartDate = task.startDate || task.createdAt || new Date().toISOString();
      const defaultDueDate = task.dueDate || '';

      setEditData({
        name: task.name || '',
        description: task.description || '',
        priority: task.priority || 'normal',
        status: task.status || 'new-requests',
        startDate: formatDateForPicker(defaultStartDate),
        dueDate: formatDateForPicker(defaultDueDate),
        assignedUsers: [task.assignedTo?.id || task.createdBy?.id || ''], // Default to current assignee or creator
      });

      // Debug: Log description format
      console.log('🔍 Task description format:', {
        taskId: task.id,
        descriptionRaw: task.description,
        descriptionLength: task.description?.length,
        hasNewlines: task.description?.includes('\n'),
        hasBr: task.description?.includes('<br>'),
      });

      console.log('TaskDetailModal: Loaded task data:', {
        taskId: task.id,
        startDate: task.startDate,
        dueDate: task.dueDate,
        formattedStartDate: formatDateForPicker(task.startDate || task.createdAt || ''),
        formattedDueDate: formatDateForPicker(task.dueDate || ''),
      });
    }
  }, [task]);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadAvailableUsers();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
      return () => {
        document.body.classList.remove('modal-open');
      };
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditMode && (e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (isEditMode && e.key === 'Escape') {
        e.preventDefault();
        handleEditToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditMode, isOpen]);

  // Handlers for new features
  const handleAttachmentsChange = (newAttachments: TaskAttachment[]) => {
    setAttachments(newAttachments);
  };

  const handleProgressChange = (progress: ChecklistProgress) => {
    setChecklistProgress(progress);
  };

  // const handleScheduleChange = async (
  //   scheduled: boolean,
  //   scheduledDate?: string,
  //   scheduledTime?: string
  // ) => {
  //   setIsScheduled(scheduled);

  //   // Trigger task list reload to show updated scheduling info
  //   if (onUpdate) {
  //     try {
  //       // Update the current task object with new scheduling info
  //       const updatedTask = {
  //         ...task,
  //         scheduled_date: scheduled ? scheduledDate : null,
  //         scheduled_time: scheduled ? scheduledTime : null,
  //         source: scheduled ? 'manual' : task?.source || 'manual',
  //       };

  //       console.log('🔧 TaskDetailModal: Updating task with scheduling info:', {
  //         taskId: task?.id,
  //         scheduled_date: updatedTask.scheduled_date,
  //         scheduled_time: updatedTask.scheduled_time,
  //         allDates: {
  //           startDate: updatedTask.startDate,
  //           endDate: updatedTask.endDate,
  //           dueDate: updatedTask.dueDate,
  //           scheduled_date: updatedTask.scheduled_date,
  //         },
  //       });

  //       // This will trigger a reload in TaskList
  //       await onUpdate(updatedTask);

  //       console.log('✅ Task scheduling updated and list reloaded');
  //     } catch (error) {
  //       console.error('❌ Error reloading tasks after scheduling:', error);
  //     }
  //   }
  // };

  // Inline editing handlers
  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset data
      if (task) {
        const formatDateForPicker = (dateString: string) => {
          if (!dateString) return '';
          const date = parseVietnameseDate(dateString);
          if (!date) return '';
          return date.toISOString().split('T')[0];
        };

        setEditData({
          name: task.name || '',
          description: task.description || '',
          priority: task.priority || 'normal',
          status: task.status || 'new-requests',
          startDate: formatDateForPicker(task.startDate || task.createdAt || ''),
          dueDate: formatDateForPicker(task.dueDate || ''),
          assignedUsers: [task.assignedTo?.id || task.createdBy?.id || ''],
        });
      }
    }
    setIsEditMode(!isEditMode);
    // Close all pickers when toggling edit mode
    setShowStartDatePicker(false);
    setShowDueDatePicker(false);
    setShowUserPicker(false);
  };

  const handleSave = async () => {
    if (task && onUpdate) {
      try {
        await onUpdate({
          ...task,
          ...editData,
          id: task.id,
        });
        setIsEditMode(false);
      } catch (error) {
        console.error('Failed to save task:', error);
        // Keep edit mode open if save fails
      }
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    // Handle date fields specially to ensure proper format
    if ((field === 'startDate' || field === 'dueDate') && typeof value === 'string') {
      // If it's an ISO string from date picker, extract just the date part
      const dateValue = value.includes('T') ? value.split('T')[0] : value;
      console.log(`📅 ${field} changed:`, value, '→', dateValue);

      setEditData(prev => ({
        ...prev,
        [field]: dateValue,
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Helper functions for user management
  const handleAddUser = (userId: string) => {
    if (!editData.assignedUsers.includes(userId)) {
      setEditData(prev => ({
        ...prev,
        assignedUsers: [...prev.assignedUsers, userId],
      }));
    }
    setShowUserPicker(false);
  };

  const handleRemoveUser = (userId: string) => {
    setEditData(prev => ({
      ...prev,
      assignedUsers: prev.assignedUsers.filter(id => id !== userId),
    }));
  };

  // Handler for moving task to different date
  const handleMoveTask = async () => {
    if (!task || !moveToDate || !onUpdate) return;

    try {
      // Update the task's scheduled date
      await onUpdate({
        ...task,
        startDate: moveToDate,
        // Also update scheduled_date if it exists
        scheduled_date: moveToDate,
      });

      // Close the modal and reset state
      setShowMoveDatePicker(false);
      setMoveToDate('');

      alert(
        `✅ Đã chuyển công việc "${task.name}" sang ngày ${new Date(moveToDate).toLocaleDateString('vi-VN')}`
      );
    } catch (error) {
      console.error('Error moving task:', error);
      alert('Không thể chuyển công việc. Vui lòng thử lại.');
    }
  };

  // Helper function for smart date parsing and formatting
  const parseVietnameseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Try ISO format first (2023-09-10, 2023-09-10T00:00:00Z)
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Try Vietnamese format: "30 Th9, 2023" or "30 thg 9, 2023"
    const vietnamesePattern = /(\d{1,2})\s+(Th|thg)\s*(\d{1,2}),?\s*(\d{4})/i;
    const match = dateString.match(vietnamesePattern);

    if (match) {
      const day = parseInt(match[1]);
      const month = parseInt(match[3]) - 1; // JavaScript months are 0-indexed
      const year = parseInt(match[4]);

      date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try other common formats
    const formats = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // dd/mm/yyyy
      /(\d{4})-(\d{1,2})-(\d{1,2})/, // yyyy-mm-dd
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        if (format === formats[0]) {
          // dd/mm/yyyy
          date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        } else {
          // yyyy-mm-dd
          date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
        }

        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    return null;
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return 'Chưa đặt';

    const date = parseVietnameseDate(dateString);
    if (!date) {
      console.warn('Could not parse date:', dateString);
      return 'Ngày không hợp lệ';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!isOpen || !task) return null;

  // Debug: log task data to see what dates we have
  console.log('TaskDetailModal task data:', {
    id: task.id,
    name: task.name,
    startDate: task.startDate,
    createdAt: task.createdAt,
    dueDate: task.dueDate,
  });

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
    return workTypeOptions.find(option => option.value === workType) || workTypeOptions[0];
  };

  // const formatDate = (dateString: string) => {
  //   // Debug: log the dateString to see what we're getting
  //   console.log('TaskDetailModal formatDate input:', dateString);

  //   if (!dateString) return 'N/A';

  //   try {
  //     const date = new Date(dateString);

  //     // Kiểm tra nếu date không hợp lệ
  //     if (isNaN(date.getTime())) {
  //       console.log('Invalid date:', dateString);
  //       return 'N/A';
  //     }

  //     const day = date.getDate().toString().padStart(2, '0');
  //     const month = (date.getMonth() + 1).toString().padStart(2, '0');
  //     return `${day} thg ${month}`;
  //   } catch (e) {
  //     console.log('Date parsing error:', e, dateString);
  //     return 'N/A';
  //   }
  // };

  const workTypeInfo = getWorkTypeInfo(task.workType);
  const WorkTypeIcon = workTypeInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 xs:p-2 sm:p-4">
      <div className="bg-[#1a1f2e] rounded-lg sm:rounded-2xl w-full max-w-sm xs:max-w-md sm:max-w-2xl md:max-w-3xl lg:max-w-4xl h-[98vh] xs:h-[96vh] sm:h-[90vh] shadow-2xl border border-gray-700/50 flex flex-col overflow-hidden">
        {/* Header - Mobile Optimized */}
        <div
          className={`border-b border-gray-700 flex-shrink-0 ${
            isEditMode
              ? 'bg-gradient-to-r from-orange-600/20 to-yellow-600/20'
              : 'bg-gradient-to-r from-blue-600/10 to-purple-600/10'
          }`}
        >
          {/* Mobile Header Layout */}
          <div className="p-2 xs:p-3 sm:p-4 md:p-6">
            {/* Mobile: Stack vertically, Desktop: Horizontal */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
              {/* Top Row on Mobile: Title + Close Button */}
              <div className="flex items-center justify-between gap-3 md:gap-4 flex-1 min-w-0">
                {/* Work Type Badge - Smaller on mobile */}
                <div
                  className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-white text-xs font-medium ${workTypeInfo.color} flex-shrink-0`}
                >
                  <WorkTypeIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">{workTypeInfo.label}</span>
                </div>

                {/* Task Title - Responsive - Editable */}
                {isEditMode ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className="text-base md:text-lg font-bold text-white bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-1 flex-1 min-w-0 focus:border-blue-500 focus:outline-none"
                    placeholder="Tên công việc..."
                  />
                ) : (
                  <h2 className="text-base md:text-lg font-bold text-white break-words leading-tight flex-1 min-w-0">
                    {task.name}
                  </h2>
                )}

                {/* Edit Mode Indicator */}
                {isEditMode && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/20 rounded-full border border-orange-500/30">
                    <Edit3 className="w-3 h-3 text-orange-400" />
                    <span className="text-xs text-orange-300 hidden sm:inline">Đang chỉnh sửa</span>
                  </div>
                )}

                {/* Close button - Always visible on mobile */}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0 md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Row on Mobile: Status + Actions */}
              <div className="flex items-center justify-between md:justify-end gap-2">
                {/* Status and Priority - Editable */}
                <div className="flex items-center gap-2">
                  <StatusPriorityEditor
                    status={isEditMode ? editData.status : task.status}
                    priority={isEditMode ? editData.priority : task.priority}
                    onStatusChange={status => handleInputChange('status', status)}
                    onPriorityChange={priority => handleInputChange('priority', priority)}
                    isEditMode={isEditMode}
                  />
                </div>

                {/* Mobile Edit Button */}
                <div className="flex md:hidden items-center gap-1">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Lưu"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEditToggle}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Action Buttons - Desktop only */}
                <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                  {isEditMode ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                        title="Lưu thay đổi"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleEditToggle}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setShowMoveDatePicker(true)}
                        className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors"
                        title="Chuyển sang ngày khác"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={onDelete}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Meta Info - Horizontal Layout */}
            <div className="task-detail-meta-mobile mt-2 md:mt-3">
              {/* Horizontal grid layout để tiết kiệm không gian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {/* Start Date - iOS Style - Compact */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-400 text-xs block">Bắt đầu:</span>
                    {isEditMode ? (
                      <IOSDatePicker
                        value={editData.startDate || ''}
                        onChange={(date: string) => {
                          console.log('Start date changed:', date);
                          handleInputChange('startDate', date);
                        }}
                        placeholder="Chọn ngày bắt đầu"
                        isOpen={showStartDatePicker}
                        onToggle={() => {
                          setShowStartDatePicker(!showStartDatePicker);
                          setShowDueDatePicker(false); // Đóng due date picker
                          setShowUserPicker(false); // Đóng user picker
                        }}
                        onClose={() => setShowStartDatePicker(false)}
                        color="green"
                        buttonClassName="text-xs"
                      />
                    ) : (
                      <span className="text-white text-xs truncate">
                        {formatDateForDisplay(task.startDate || task.createdAt || '')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Creator - Compact */}
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-400 text-xs block">Tạo bởi:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs truncate">
                        {task.createdBy?.name || 'Không xác định'}
                      </span>
                      {/* 🏷️ Legacy cross-team task indicator */}
                      {task.createdBy?.team_id &&
                        task.assignedTo?.team_id &&
                        task.createdBy.team_id !== task.assignedTo.team_id && (
                          <span className="px-1.5 py-0.5 bg-orange-600/20 border border-orange-500/30 rounded text-xs text-orange-300 font-medium whitespace-nowrap">
                            Cross-team
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Assignees - Compact */}
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-400 text-xs block">Thực hiện:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editData.assignedUsers.map(userId => {
                        const user = availableUsers.find(u => u.id === userId);
                        return user ? (
                          <div
                            key={userId}
                            className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full text-xs"
                          >
                            <span>{user.name}</span>
                            {isEditMode && editData.assignedUsers.length > 1 && (
                              <button
                                onClick={() => handleRemoveUser(userId)}
                                className="hover:text-red-400 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ) : null;
                      })}
                      {isEditMode && (
                        <div className="relative">
                          <button
                            onClick={() => setShowUserPicker(!showUserPicker)}
                            className="flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-full text-xs transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thêm</span>
                          </button>
                          {showUserPicker && (
                            <div className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 min-w-64 max-w-80">
                              {loadingUsers ? (
                                <div className="px-3 py-4 text-center text-gray-400 text-sm">
                                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                  Đang tải danh sách...
                                </div>
                              ) : availableUsers.length === 0 ? (
                                <div className="px-3 py-4 text-center text-gray-400 text-sm">
                                  Không có người dùng khả dụng
                                </div>
                              ) : (
                                <div className="max-h-64 overflow-y-auto">
                                  {availableUsers
                                    .filter(
                                      (user: Employee) => !editData.assignedUsers.includes(user.id)
                                    )
                                    .map((user: Employee) => (
                                      <button
                                        key={user.id}
                                        onClick={() => handleAddUser(user.id)}
                                        className="w-full text-left px-3 py-2 hover:bg-gray-700 text-white text-sm first:rounded-t-lg last:rounded-b-lg transition-colors"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                            {user.name.charAt(0).toUpperCase()}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{user.name}</div>
                                            <div className="text-xs text-gray-400 truncate">
                                              {user.email} • {user.location}
                                              {user.team &&
                                                typeof user.team === 'object' &&
                                                !Array.isArray(user.team) && (
                                                  <span> • {user.team.name}</span>
                                                )}
                                            </div>
                                          </div>
                                        </div>
                                      </button>
                                    ))}
                                  {availableUsers.filter(
                                    (user: Employee) => !editData.assignedUsers.includes(user.id)
                                  ).length === 0 && (
                                    <div className="px-3 py-4 text-center text-gray-400 text-sm">
                                      Tất cả người dùng đã được gán
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Due Date - iOS Style - Compact */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="text-gray-400 text-xs block">Hạn chót:</span>
                    {isEditMode ? (
                      <IOSDatePicker
                        value={editData.dueDate || ''}
                        onChange={(date: string) => {
                          console.log('Due date changed:', date);
                          handleInputChange('dueDate', date);
                        }}
                        placeholder="Chọn hạn chót"
                        isOpen={showDueDatePicker}
                        onToggle={() => {
                          setShowDueDatePicker(!showDueDatePicker);
                          setShowStartDatePicker(false); // Đóng start date picker
                          setShowUserPicker(false); // Đóng user picker
                        }}
                        onClose={() => setShowDueDatePicker(false)}
                        color="red"
                        buttonClassName="text-xs"
                        minDate={editData.startDate || undefined}
                      />
                    ) : (
                      <span className="text-white text-xs truncate">
                        {formatDateForDisplay(task.dueDate || '')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Scrollable Area - Fixed */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-900/50 p-2 xs:p-3 sm:p-4 md:p-6"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollBehavior: 'smooth',
            overscrollBehavior: 'contain',
            maxHeight: 'calc(100vh - 150px)', // Giảm chiều cao cho mobile
          }}
        >
          <div className="max-w-4xl mx-auto space-y-4 md:space-y-8">
            {/* Description Section - Mobile Optimized - Expandable */}
            <div className="task-detail-section-mobile bg-white/5 rounded-xl md:rounded-2xl border border-gray-700/30">
              {/* Content Header - Compact on mobile */}
              <div className="p-4 md:p-6 border-b border-gray-700/20">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Target className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">
                    Thông tin công việc chi tiết
                  </h3>
                </div>
              </div>

              {/* Content Body - Expandable on mobile - Editable */}
              <div className="p-4 md:p-8 flex-1 flex flex-col">
                {isEditMode ? (
                  <div className="flex-1 flex flex-col">
                    <label className="block text-white font-medium mb-2">Mô tả công việc</label>
                    <RichTextEditor
                      value={editData.description}
                      onChange={value => handleInputChange('description', value)}
                      placeholder="Nhập mô tả chi tiết về công việc..."
                      className="flex-1"
                    />
                  </div>
                ) : (
                  <>
                    {task.description ? (
                      <div className="prose prose-invert prose-sm md:prose-lg max-w-none flex-1">
                        <RichTextDisplay
                          content={task.description}
                          className="task-detail-text-mobile text-gray-200 leading-relaxed font-normal h-full"
                        />
                      </div>
                    ) : (
                      <div className="text-center py-8 md:py-16 flex-1 flex flex-col justify-center">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                          <Target className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-500 text-base md:text-lg">Chưa có mô tả chi tiết</p>
                        <p className="text-gray-600 text-xs md:text-sm mt-2">
                          Thêm mô tả để cung cấp thông tin chi tiết về công việc này
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Checklist Section - Now Active! */}
            <TaskChecklist taskId={task.id} onProgressChange={handleProgressChange} />

            {/* Scheduling Section - Hidden because individual checklist items can be scheduled */}
            {/*
              <TaskScheduling
                taskId={task.id}
                currentTask={task}
                onScheduleChange={handleScheduleChange}
              />
              */}

            {/* Attachments Section - Moved down and will be collapsed */}
            <TaskAttachments taskId={task.id} onAttachmentsChange={handleAttachmentsChange} />
          </div>
        </div>
      </div>

      {/* Move Task Date Picker Modal */}
      {showMoveDatePicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-600 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Chuyển công việc sang ngày khác
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn ngày mới:
                </label>
                <input
                  type="date"
                  value={moveToDate}
                  onChange={e => setMoveToDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {moveToDate && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                  <p className="text-purple-300 text-sm">
                    Công việc sẽ được chuyển sang:{' '}
                    <strong>{new Date(moveToDate).toLocaleDateString('vi-VN')}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMoveDatePicker(false);
                  setMoveToDate('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleMoveTask}
                disabled={!moveToDate}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Chuyển ngày
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailModal;
