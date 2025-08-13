import { AlertTriangle, Calendar, Clock, Edit, Target, Trash2, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { ScheduledTask } from '../services/schedulingService';

interface PlanDetailModalProps {
  /** Trạng thái hiển thị modal */
  isOpen: boolean;
  /** Callback đóng modal */
  onClose: () => void;
  /** Dữ liệu kế hoạch */
  plan: ScheduledTask | null;
  /** Callback chỉnh sửa kế hoạch */
  onEdit?: () => void;
  /** Callback xóa kế hoạch */
  onDelete?: () => void;
  /** Callback cập nhật kế hoạch */
  onUpdate?: (updates: any) => void;
}

const PlanDetailModal: React.FC<PlanDetailModalProps> = ({
  isOpen,
  onClose,
  plan,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
    scheduled_time: '',
  });

  // Khởi tạo dữ liệu edit khi plan thay đổi
  React.useEffect(() => {
    if (plan) {
      setEditData({
        name: plan.name || '',
        description: plan.description || '',
        priority: plan.priority || 'normal',
        scheduled_time: plan.scheduled_time || '',
      });
    }
  }, [plan]);

  // Debug logs
  console.log('🔍 PlanDetailModal render:', { isOpen, plan: plan?.name || 'null' });

  if (!isOpen || !plan) {
    console.log('❌ PlanDetailModal not rendering:', { isOpen, hasPlan: !!plan });
    return null;
  }

  // Format thời gian hiển thị
  const formatTime = (time: string) => {
    if (!time) return '';
    return time.slice(0, 5); // HH:MM
  };

  // Format ngày hiển thị
  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Lấy cấu hình màu sắc cho priority
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          label: 'Ưu tiên cao',
        };
      case 'normal':
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Ưu tiên bình thường',
        };
      case 'low':
        return {
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          label: 'Ưu tiên thấp',
        };
      default:
        return {
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Ưu tiên bình thường',
        };
    }
  };

  const priorityConfig = getPriorityConfig(plan.priority || 'normal');

  // Xử lý lưu chỉnh sửa
  const handleSaveEdit = async () => {
    if (!editData.name.trim()) {
      alert('Vui lòng nhập tên kế hoạch');
      return;
    }

    setIsLoading(true);
    try {
      if (onUpdate) {
        await onUpdate({
          id: plan.id,
          ...editData,
        });
      }
      setIsEditMode(false);
    } catch (error) {
      console.error('Lỗi khi lưu kế hoạch:', error);
      alert('Không thể lưu kế hoạch. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý hủy chỉnh sửa
  const handleCancelEdit = () => {
    setEditData({
      name: plan.name || '',
      description: plan.description || '',
      priority: plan.priority || 'normal',
      scheduled_time: plan.scheduled_time || '',
    });
    setIsEditMode(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700 mx-2 sm:mx-0">
        {/* Header */}
        <div
          className={`p-3 sm:p-4 border-b border-gray-700 ${
            isEditMode
              ? 'bg-gradient-to-r from-orange-600/20 to-yellow-600/20'
              : 'bg-gradient-to-r from-blue-600/10 to-purple-600/10'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-white truncate">
                  {isEditMode ? 'Chỉnh sửa kế hoạch' : 'Chi tiết kế hoạch'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-400 truncate">
                  {formatDate(plan.scheduled_date)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(95vh-180px)] sm:max-h-[calc(90vh-200px)]">
          {isEditMode ? (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Tên kế hoạch */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tên kế hoạch</label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Nhập tên kế hoạch..."
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
                <textarea
                  value={editData.description}
                  onChange={e => setEditData({ ...editData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Nhập mô tả chi tiết..."
                />
              </div>

              {/* Thời gian và Ưu tiên */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Thời gian</label>
                  <input
                    type="time"
                    value={editData.scheduled_time}
                    onChange={e => setEditData({ ...editData, scheduled_time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={editData.priority}
                    onChange={e =>
                      setEditData({
                        ...editData,
                        priority: e.target.value as 'low' | 'normal' | 'high',
                      })
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="low">Ưu tiên thấp</option>
                    <option value="normal">Ưu tiên bình thường</option>
                    <option value="high">Ưu tiên cao</option>
                  </select>
                </div>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="space-y-6">
              {/* Tên kế hoạch */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                {plan.description && (
                  <p className="text-gray-300 leading-relaxed">{plan.description}</p>
                )}
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Thời gian */}
                {plan.scheduled_time && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Thời gian</p>
                      <p className="text-sm sm:text-base text-white font-medium">
                        {formatTime(plan.scheduled_time)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Mức độ ưu tiên */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                  <AlertTriangle
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${priorityConfig.color} flex-shrink-0`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-400">Mức độ ưu tiên</p>
                    <p className={`text-sm sm:text-base font-medium ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </p>
                  </div>
                </div>

                {/* Người tạo */}
                {plan.createdBy && (
                  <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Người tạo</p>
                      <p className="text-sm sm:text-base text-white font-medium truncate">
                        {plan.createdBy}
                      </p>
                    </div>
                  </div>
                )}

                {/* Ngày tạo */}
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-gray-400">Ngày lên lịch</p>
                    <p className="text-sm sm:text-base text-white font-medium">
                      {formatDate(plan.scheduled_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-800/50">
          {isEditMode ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={handleCancelEdit}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 text-sm sm:text-base"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading || !editData.name.trim()}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  Chỉnh sửa
                </button>
              </div>

              <button
                onClick={onDelete}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm sm:text-base"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                Xóa
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlanDetailModal;
