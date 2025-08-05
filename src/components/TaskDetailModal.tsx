import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, Edit, Trash2, Building, Target, User, CheckSquare, Save, Edit3 } from 'lucide-react';
import { TaskWithUsers } from '../services/taskService';
import TaskStatusPriority from './TaskStatusPriority';
import StatusPriorityEditor from './StatusPriorityEditor';
import TaskAttachments from './TaskAttachments';
import TaskChecklist from './TaskChecklist';
import TaskScheduling from './TaskScheduling';
import { TaskAttachment } from '../services/attachmentService';
import { ChecklistProgress } from '../services/checklistService';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithUsers | null;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate?: (taskData: any) => void; // New prop for inline updates
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onUpdate
}) => {
  // State for new features
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({ total: 0, completed: 0, percentage: 0 });
  const [isScheduled, setIsScheduled] = useState(false);

  // State for inline editing
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    status: 'new-requests' as 'new-requests' | 'approved' | 'live',
    dueDate: ''
  });

  // Load task data when modal opens or task changes
  useEffect(() => {
    if (task) {
      setEditData({
        name: task.name || '',
        description: task.description || '',
        priority: task.priority || 'normal',
        status: task.status || 'new-requests',
        dueDate: task.dueDate || ''
      });
    }
  }, [task]);

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

  const handleScheduleChange = async (scheduled: boolean, scheduledDate?: string, scheduledTime?: string) => {
    setIsScheduled(scheduled);

    // Trigger task list reload to show updated scheduling info
    if (onUpdate) {
      try {
        // Update the current task object with new scheduling info
        const updatedTask = {
          ...task,
          scheduled_date: scheduled ? scheduledDate : null,
          scheduled_time: scheduled ? scheduledTime : null,
          source: scheduled ? 'manual' : (task?.source || 'manual')
        };

        console.log('🔧 TaskDetailModal: Updating task with scheduling info:', {
          taskId: task?.id,
          scheduled_date: updatedTask.scheduled_date,
          scheduled_time: updatedTask.scheduled_time,
          allDates: {
            startDate: updatedTask.startDate,
            endDate: updatedTask.endDate,
            dueDate: updatedTask.dueDate,
            scheduled_date: updatedTask.scheduled_date
          }
        });

        // This will trigger a reload in TaskList
        await onUpdate(updatedTask);

        console.log('✅ Task scheduling updated and list reloaded');
      } catch (error) {
        console.error('❌ Error reloading tasks after scheduling:', error);
      }
    }
  };

  // Inline editing handlers
  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit - reset data
      if (task) {
        setEditData({
          name: task.name || '',
          description: task.description || '',
          priority: task.priority || 'normal',
          status: task.status || 'new-requests',
          dueDate: task.dueDate || ''
        });
      }
    }
    setIsEditMode(!isEditMode);
  };

  const handleSave = async () => {
    if (task && onUpdate) {
      try {
        await onUpdate({
          ...task,
          ...editData,
          id: task.id
        });
        setIsEditMode(false);
      } catch (error) {
        console.error('Failed to save task:', error);
        // Keep edit mode open if save fails
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  if (!isOpen || !task) return null;

  // Debug: log task data to see what dates we have
  console.log('TaskDetailModal task data:', {
    id: task.id,
    name: task.name,
    startDate: task.startDate,
    createdAt: task.createdAt,
    dueDate: task.dueDate
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
    { value: 'customer-old', label: 'Khách hàng cũ', icon: User, color: 'bg-orange-400' }
  ];

  const getWorkTypeInfo = (workType: string) => {
    return workTypeOptions.find(option => option.value === workType) || workTypeOptions[0];
  };

  const formatDate = (dateString: string) => {
    // Debug: log the dateString to see what we're getting
    console.log('TaskDetailModal formatDate input:', dateString);

    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);

      // Kiểm tra nếu date không hợp lệ
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return 'N/A';
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      return `${day} thg ${month}`;
    } catch (e) {
      console.log('Date parsing error:', e, dateString);
      return 'N/A';
    }
  };



  const workTypeInfo = getWorkTypeInfo(task.workType);
  const WorkTypeIcon = workTypeInfo.icon;

  return (
    <div className="fixed inset-0 modal-backdrop-enhanced modal-container-responsive z-50">
      <div className="create-task-modal task-detail-modal-mobile bg-[#1a1f2e] rounded-2xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl overflow-hidden shadow-2xl border border-gray-700/50 modal-animate-in">
        <div className="create-task-modal-content flex flex-col">
          {/* Header - Mobile Optimized */}
          <div className={`task-detail-header-mobile border-b border-gray-700 flex-shrink-0 ${
            isEditMode
              ? 'bg-gradient-to-r from-orange-600/20 to-yellow-600/20'
              : 'bg-gradient-to-r from-blue-600/10 to-purple-600/10'
          }`}>
            {/* Mobile Header Layout */}
            <div className="p-3 md:p-4">
              {/* Mobile: Stack vertically, Desktop: Horizontal */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                {/* Top Row on Mobile: Title + Close Button */}
                <div className="flex items-center justify-between gap-3 md:gap-4 flex-1 min-w-0">
                  {/* Work Type Badge - Smaller on mobile */}
                  <div className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-white text-xs font-medium ${workTypeInfo.color} flex-shrink-0`}>
                    <WorkTypeIcon className="w-3 h-3" />
                    <span className="hidden sm:inline">{workTypeInfo.label}</span>
                  </div>

                  {/* Task Title - Responsive - Editable */}
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="text-base md:text-lg font-bold text-white bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-1 flex-1 min-w-0 focus:border-blue-500 focus:outline-none"
                      placeholder="Tên công việc..."
                    />
                  ) : (
                    <h2 className="text-base md:text-lg font-bold text-white break-words leading-tight flex-1 min-w-0">{task.name}</h2>
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
                      onStatusChange={(status) => handleInputChange('status', status)}
                      onPriorityChange={(priority) => handleInputChange('priority', priority)}
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

              {/* Compact Meta Info - Mobile Optimized */}
              <div className="task-detail-meta-mobile mt-2 md:mt-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-green-400" />
                  <span className="hidden sm:inline">Bắt đầu: </span>
                  <span>{formatDate(task.startDate || task.createdAt || new Date().toISOString())}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-400" />
                  <span className="hidden sm:inline">Tạo bởi: </span>
                  <span>{task.createdBy?.name || 'Không xác định'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-400" />
                  <span className="hidden sm:inline">Thực hiện: </span>
                  <span>{task.assignedTo?.name || 'Chưa phân công'}</span>
                </div>
                {(task.dueDate || isEditMode) && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-red-400" />
                    <span className="hidden sm:inline">Hạn chót: </span>
                    {isEditMode ? (
                      <input
                        type="date"
                        value={editData.dueDate ? editData.dueDate.split('T')[0] : ''}
                        onChange={(e) => handleInputChange('dueDate', e.target.value ? e.target.value + 'T00:00:00.000Z' : '')}
                        className="bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <span>{formatDate(task.dueDate || '')}</span>
                    )}
                  </div>
                )}
                {/* Checklist Progress - Compact on mobile */}
                {checklistProgress.total > 0 && (
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-green-400" />
                    <span className="hidden sm:inline">Checklist: </span>
                    <span>{checklistProgress.completed}/{checklistProgress.total} ({checklistProgress.percentage}%)</span>
                  </div>
                )}
                {/* Attachments Count - Compact on mobile */}
                {attachments.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Building className="w-3 h-3 text-purple-400" />
                    <span className="hidden sm:inline">Tệp đính kèm: </span>
                    <span>{attachments.length}</span>
                  </div>
                )}
                {/* Scheduled Status - Compact on mobile */}
                {isScheduled && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    <span>Đã lên lịch</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content - Mobile Optimized - ONLY Scroll Area */}
          <div className="task-detail-scroll-mobile bg-gray-900/50">
            <div className="task-detail-content-mobile max-w-4xl mx-auto space-y-4 md:space-y-8">
              {/* Description Section - Mobile Optimized - Expandable */}
              <div className="task-detail-section-mobile bg-white/5 rounded-xl md:rounded-2xl border border-gray-700/30">
                {/* Content Header - Compact on mobile */}
                <div className="p-4 md:p-6 border-b border-gray-700/20">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Target className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-white">Thông tin công việc chi tiết</h3>
                  </div>
                </div>

                {/* Content Body - Expandable on mobile - Editable */}
                <div className="p-4 md:p-8 flex-1 flex flex-col">
                  {isEditMode ? (
                    <div className="flex-1 flex flex-col">
                      <label className="block text-white font-medium mb-2">
                        Mô tả công việc
                      </label>
                      <textarea
                        value={editData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="flex-1 min-h-[200px] p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                        placeholder="Nhập mô tả chi tiết về công việc..."
                      />
                    </div>
                  ) : (
                    <>
                      {task.description ? (
                        <div className="prose prose-invert prose-sm md:prose-lg max-w-none flex-1">
                          <div className="task-detail-text-mobile text-gray-200 leading-relaxed whitespace-pre-wrap font-normal h-full">
                            {task.description}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 md:py-16 flex-1 flex flex-col justify-center">
                          <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                            <Target className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-500 text-base md:text-lg">Chưa có mô tả chi tiết</p>
                          <p className="text-gray-600 text-xs md:text-sm mt-2">Thêm mô tả để cung cấp thông tin chi tiết về công việc này</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Checklist Section - Now Active! */}
              <TaskChecklist
                taskId={task.id}
                onProgressChange={handleProgressChange}
              />

              {/* Scheduling Section - Hidden because individual checklist items can be scheduled */}
              {/*
              <TaskScheduling
                taskId={task.id}
                currentTask={task}
                onScheduleChange={handleScheduleChange}
              />
              */}

              {/* Attachments Section - Moved down and will be collapsed */}
              <TaskAttachments
                taskId={task.id}
                onAttachmentsChange={handleAttachmentsChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
