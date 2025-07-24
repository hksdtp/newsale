import React from 'react';
import { X, Calendar, Clock, User, Building, Flag, FileText, Users, Target, Edit, Trash2 } from 'lucide-react';
import { TaskWithUsers } from '../services/taskService';
import TaskStatusPriority from './TaskStatusPriority';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskWithUsers | null;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  task, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !task) return null;

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
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new-requests': return 'Chưa tiến hành';
      case 'approved': return 'Đang tiến hành';
      case 'live': return 'Đã hoàn thành';
      default: return status;
    }
  };

  const workTypeInfo = getWorkTypeInfo(task.workType);
  const WorkTypeIcon = workTypeInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Work Type Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${workTypeInfo.color}`}>
                  <WorkTypeIcon className="w-4 h-4" />
                  {workTypeInfo.label}
                </div>
              </div>
              
              {/* Task Title */}
              <h2 className="text-2xl font-bold text-white mb-2">{task.name}</h2>
              
              {/* Status and Priority */}
              <div className="flex items-center gap-4">
                <TaskStatusPriority status={task.status} priority={task.priority} />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Mô tả chi tiết
              </h3>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed">{task.description}</p>
              </div>
            </div>
          )}

          {/* Task Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Thời gian
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Ngày bắt đầu:</span>
                  <span className="text-white font-medium">{formatDate(task.startDate)}</span>
                </div>
                
                {task.dueDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <span className="text-gray-400">Hạn chót:</span>
                    <span className="text-white font-medium">{formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* People */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                Người liên quan
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Người tạo:</span>
                  <span className="text-white font-medium">{task.createdBy?.name || 'Không xác định'}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Người thực hiện:</span>
                  <span className="text-white font-medium">{task.assignedTo?.name || 'Chưa phân công'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Building className="w-5 h-5" />
              Thông tin bổ sung
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <span className="text-gray-400">Phòng ban:</span>
                <span className="text-white font-medium">{task.department === 'HN' ? 'Hà Nội' : 'Hồ Chí Minh'}</span>
              </div>
              
              {task.campaignType && (
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400">Loại chiến dịch:</span>
                  <span className="text-white font-medium">{task.campaignType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Platform Tags */}
          {task.platform && task.platform.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Nền tảng</h3>
              <div className="flex flex-wrap gap-2">
                {task.platform.map((platform, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>ID: {task.id}</span>
            <span>Tạo lúc: {new Date(task.createdAt || Date.now()).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
