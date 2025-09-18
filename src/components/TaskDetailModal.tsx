import { Calendar, Edit, Plus, Trash2, User, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
  onUpdate?: (taskData: TaskWithUsers) => void;
  onMove?: (task: TaskWithUsers, newDate: string) => void;
}

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return 'Chưa thiết lập';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
  onUpdate,
  onMove,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>({
    assignedUsers: [],
  });
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);
  const [showMoveDatePicker, setShowMoveDatePicker] = useState(false);
  const [moveToDate, setMoveToDate] = useState('');
  const [availableUsers, setAvailableUsers] = useState<Employee[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [checklistProgress, setChecklistProgress] = useState<ChecklistProgress>({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

  useEffect(() => {
    if (task) {
      setEditData({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        assignedUsers: task.assignedTo ? [task.assignedTo.id] : [],
      });
    }
  }, [task]);

  useEffect(() => {
    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const users = await employeeService.getAllEmployees();
        setAvailableUsers(users);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (isEditMode) {
      loadUsers();
    }
  }, [isEditMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (isEditMode && (e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, isEditMode, onClose]);

  if (!isOpen || !task) return null;

  const handleInputChange = (field: string, value: any) => {
    setEditData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      setEditData({
        name: task.name,
        description: task.description,
        status: task.status,
        priority: task.priority,
        startDate: task.startDate,
        dueDate: task.dueDate,
        assignedUsers: task.assignedTo ? [task.assignedTo.id] : [],
      });
    }
  };

  const handleSave = async () => {
    if (onUpdate) {
      const assignedUser =
        (editData.assignedUsers || []).length > 0
          ? availableUsers.find(user => user.id === (editData.assignedUsers || [])[0])
          : null;

      const updatedTask = {
        ...task,
        ...editData,
        assignedTo: assignedUser
          ? {
              id: assignedUser.id,
              name: assignedUser.name,
              email: assignedUser.email,
              team_id: assignedUser.team_id,
              location: assignedUser.location,
            }
          : null,
      };
      onUpdate(updatedTask);
    }
    setIsEditMode(false);
  };

  const handleAddUser = (userId: string) => {
    if (!(editData.assignedUsers || []).includes(userId)) {
      handleInputChange('assignedUsers', [...(editData.assignedUsers || []), userId]);
    }
    setShowUserPicker(false);
  };

  const handleRemoveUser = (userId: string) => {
    handleInputChange(
      'assignedUsers',
      (editData.assignedUsers || []).filter((id: string) => id !== userId)
    );
  };

  const handleMoveTask = () => {
    if (moveToDate && onMove) {
      onMove(task, moveToDate);
      setShowMoveDatePicker(false);
      setMoveToDate('');
    }
  };

  const handleProgressChange = (progress: ChecklistProgress) => {
    setChecklistProgress(progress);
  };

  const handleAttachmentsChange = (newAttachments: TaskAttachment[]) => {
    setAttachments(newAttachments);
  };

  return (
    <>
      {/* Blur Background Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-8">
        <div className="bg-white w-full max-w-7xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col backdrop-blur-none">
          {/* Header */}
          <header className="flex justify-between items-center pb-6 pt-8 px-8 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {(Array.isArray(task.workType) ? task.workType : [task.workType]).map(
                  (type, index) => {
                    const workTypeMap: Record<string, { label: string; color: string }> = {
                      'sbg-new': { label: 'SBG mới', color: 'bg-blue-100 text-blue-600' },
                      'sbg-old': { label: 'SBG cũ', color: 'bg-indigo-100 text-indigo-600' },
                      'partner-new': { label: 'Đối tác mới', color: 'bg-green-100 text-green-600' },
                      'partner-old': {
                        label: 'Đối tác cũ',
                        color: 'bg-emerald-100 text-emerald-600',
                      },
                      'kts-new': { label: 'KTS mới', color: 'bg-purple-100 text-purple-600' },
                      'kts-old': { label: 'KTS cũ', color: 'bg-violet-100 text-violet-600' },
                      'customer-new': {
                        label: 'Khách hàng mới',
                        color: 'bg-orange-100 text-orange-600',
                      },
                      'customer-old': {
                        label: 'Khách hàng cũ',
                        color: 'bg-amber-100 text-amber-600',
                      },
                      other: { label: 'Công việc khác', color: 'bg-gray-100 text-gray-600' },
                    };
                    const info = workTypeMap[type] || workTypeMap.other;
                    return (
                      <span key={index} className={`font-bold py-2 px-3 rounded-lg ${info.color}`}>
                        {info.label}
                      </span>
                    );
                  }
                )}
              </div>
              {isEditMode ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  className="text-3xl font-bold text-black bg-transparent border-b-2 border-blue-500 px-1 focus:outline-none"
                  placeholder="Tên công việc..."
                />
              ) : (
                <h1 className="text-3xl font-bold text-black">{task.name}</h1>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusPriorityEditor
                status={isEditMode ? editData.status : task.status}
                priority={isEditMode ? editData.priority : task.priority}
                onStatusChange={status => handleInputChange('status', status)}
                onPriorityChange={priority => handleInputChange('priority', priority)}
                isEditMode={isEditMode}
              />
              {!isEditMode ? (
                <button
                  onClick={handleEditToggle}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                  title="Chỉnh sửa"
                >
                  <Edit className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
                >
                  Lưu
                </button>
              )}
              <button
                onClick={onDelete}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                title="Xóa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>
          <div className="overflow-y-auto flex-1">
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 px-8 border-b border-gray-200 overflow-visible">
              {/* Start Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-700">Bắt đầu:</p>
                  {isEditMode ? (
                    <IOSDatePicker
                      value={editData.startDate || ''}
                      onChange={(date: string) => handleInputChange('startDate', date)}
                      placeholder="Chọn ngày bắt đầu"
                      isOpen={showStartDatePicker}
                      onToggle={() => {
                        setShowStartDatePicker(!showStartDatePicker);
                        setShowDueDatePicker(false);
                        setShowUserPicker(false);
                      }}
                      onClose={() => setShowStartDatePicker(false)}
                      color="green"
                      buttonClassName="text-sm font-medium text-gray-900"
                    />
                  ) : (
                    <p className="font-medium text-black">
                      {formatDateForDisplay(task.startDate || task.createdAt || '')}
                    </p>
                  )}
                </div>
              </div>

              {/* Created By */}
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-700">Tạo bởi:</p>
                  <p className="font-medium text-black">
                    {task.createdBy?.name || 'Không xác định'}
                  </p>
                </div>
              </div>

              {/* Assigned To */}
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-700">Thực hiện:</p>
                  <div className="flex flex-wrap gap-1">
                    {(editData.assignedUsers || []).map((userId: string) => {
                      const user = availableUsers.find(u => u.id === userId);
                      return user ? (
                        <div key={userId} className="flex items-center gap-1">
                          {isEditMode && (editData.assignedUsers || []).length > 1 ? (
                            <span className="font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded text-sm flex items-center gap-1">
                              {user.name}
                              <button
                                onClick={() => handleRemoveUser(userId)}
                                className="hover:text-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : (
                            <span className="font-medium text-blue-700">{user.name}</span>
                          )}
                        </div>
                      ) : null;
                    })}
                    {isEditMode && (
                      <div className="relative">
                        <button
                          onClick={() => setShowUserPicker(!showUserPicker)}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Thêm
                        </button>
                        {showUserPicker && (
                          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 min-w-64 max-w-80">
                            {loadingUsers ? (
                              <div className="px-3 py-4 text-center text-gray-800 text-sm">
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                                Đang tải danh sách...
                              </div>
                            ) : availableUsers.length === 0 ? (
                              <div className="px-3 py-4 text-center text-gray-800 text-sm">
                                Không có người dùng khả dụng
                              </div>
                            ) : (
                              <div className="max-h-64 overflow-y-auto">
                                {availableUsers
                                  .filter(
                                    (user: Employee) =>
                                      !(editData.assignedUsers || []).includes(user.id)
                                  )
                                  .map((user: Employee) => (
                                    <button
                                      key={user.id}
                                      onClick={() => handleAddUser(user.id)}
                                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-900 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                          {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="font-medium truncate">{user.name}</div>
                                          <div className="text-xs text-gray-500 truncate">
                                            {user.email} • {user.location}
                                          </div>
                                        </div>
                                      </div>
                                    </button>
                                  ))}
                                {availableUsers.filter(
                                  (user: Employee) =>
                                    !(editData.assignedUsers || []).includes(user.id)
                                ).length === 0 && (
                                  <div className="px-3 py-4 text-center text-gray-800 text-sm">
                                    Tất cả người dùng đã được phân công
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

              {/* Due Date */}
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-700">Hạn chót:</p>
                  {isEditMode ? (
                    <IOSDatePicker
                      value={editData.dueDate || ''}
                      onChange={(date: string) => handleInputChange('dueDate', date)}
                      placeholder="Chọn hạn chót"
                      isOpen={showDueDatePicker}
                      onToggle={() => {
                        setShowDueDatePicker(!showDueDatePicker);
                        setShowStartDatePicker(false);
                        setShowUserPicker(false);
                      }}
                      onClose={() => setShowDueDatePicker(false)}
                      color="red"
                      buttonClassName="text-sm font-medium text-red-700"
                    />
                  ) : (
                    <p className="font-medium text-red-700">
                      {formatDateForDisplay(task.dueDate || '')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Description Section */}
            <div className="py-8 px-8 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mô tả công việc</h2>
              <div
                className="prose max-w-none text-gray-900 bg-white enhanced-description"
                style={{ color: '#111827' }}
              >
                {isEditMode ? (
                  <RichTextEditor
                    value={editData.description || ''}
                    onChange={(value: string) => handleInputChange('description', value)}
                  />
                ) : (
                  <RichTextDisplay
                    content={task.description || 'Chưa có mô tả'}
                    className="force-dark-text enhanced-description"
                  />
                )}
              </div>
            </div>

            {/* Checklist Section */}
            <div className="py-6 px-8 border-b border-gray-200">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-600 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold text-black">
                    Danh sách công việc con{' '}
                    <span className="text-gray-700 font-normal">
                      ({checklistProgress.completed}/{checklistProgress.total})
                    </span>
                  </h2>
                </div>
              </div>
              <TaskChecklist taskId={task.id} onProgressChange={handleProgressChange} />
            </div>

            {/* Attachments Section */}
            <div className="py-6 px-8">
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h2 className="font-semibold text-black text-lg">Tệp đính kèm</h2>
                  <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {attachments.length}
                  </span>
                </div>
              </div>
              <TaskAttachments taskId={task.id} onAttachmentsChange={handleAttachmentsChange} />
            </div>
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
    </>
  );
};

export default TaskDetailModal;
