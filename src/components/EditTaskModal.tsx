import { Save, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { TaskWithUsers } from '../services/taskService';
import { getPermissionErrorMessage, getTaskPermissions } from '../utils/taskPermissions';
import RichTextEditor from './RichTextEditor';
import WorkTypeDropdown from './WorkTypeDropdown';

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => void;
  task: TaskWithUsers | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ isOpen, onClose, onSubmit, task }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workTypes: [] as string[],
    priority: 'normal' as 'low' | 'normal' | 'high',
    status: 'new-requests' as 'new-requests' | 'approved' | 'live',
    dueDate: '',
    assignedTo: '',
    department: 'HN' as 'HN' | 'HCM',
    campaignType: '',
  });

  // Helper function to convert DD/MM/YYYY to YYYY-MM-DD for input[type="date"]
  const convertDateForInput = (dateStr: string): string => {
    if (!dateStr) return '';

    // If already in YYYY-MM-DD format, return as is
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }

    // If in DD/MM/YYYY format, convert to YYYY-MM-DD
    const ddmmyyyyPattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = dateStr.match(ddmmyyyyPattern);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month}-${day}`;
    }

    return dateStr;
  };

  // Load task data when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        workTypes: task.workType ? [task.workType] : [],
        priority: task.priority || 'normal',
        status: task.status || 'new-requests',
        dueDate: convertDateForInput(task.dueDate || ''),
        assignedTo: task.assignedTo?.name || '',
        department: task.department || 'HN',
        campaignType: task.campaignType || '',
      });
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    // Kiểm tra quyền chỉnh sửa (có ghi log nếu trái phép)
    const permissions = getTaskPermissions(task);
    if (!permissions.canEdit) {
      alert(getPermissionErrorMessage('chỉnh sửa', task.name, task.id));
      return;
    }

    onSubmit({
      ...formData,
      id: task.id,
      workType: formData.workTypes[0] || 'other', // Use first selected work type
      startDate: task.startDate, // Keep original start date
      dueDate: formData.dueDate, // Fix: use dueDate instead of endDate
      assignedToId: task.assignedTo?.id, // Keep original assigned user
    });
    onClose();
  };

  const handleWorkTypeChange = (workTypes: string[]) => {
    setFormData(prev => ({
      ...prev,
      workTypes,
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!isOpen || !task) return null;

  // Kiểm tra quyền chỉnh sửa
  const permissions = getTaskPermissions(task);
  const canEdit = permissions.canEdit;

  const statusOptions = [
    { value: 'new-requests', label: 'Chưa tiến hành' },
    { value: 'approved', label: 'Đang tiến hành' },
    { value: 'live', label: 'Đã hoàn thành' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#1a1f2e] rounded-lg sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50 flex flex-col mx-2 sm:mx-0">
        {/* Header - Flex-shrink-0 để không bị co lại */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <Save className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                  {canEdit ? 'Chỉnh sửa công việc' : 'Xem chi tiết công việc'}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                  {canEdit
                    ? 'Cập nhật thông tin công việc'
                    : 'Chỉ người tạo công việc mới có quyền chỉnh sửa'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex-shrink-0 p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Form - Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <form
            id="edit-task-form"
            onSubmit={handleSubmit}
            className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6"
          >
            {/* Work Type */}
            <WorkTypeDropdown
              label="Loại công việc"
              value={formData.workTypes}
              onChange={handleWorkTypeChange}
              placeholder="Chọn loại công việc"
              disabled={!canEdit}
              required
            />

            {/* Task Name */}
            <div>
              <label className="block text-white font-medium mb-2">
                Tên công việc <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                disabled={!canEdit}
                className={`w-full p-3 border rounded-lg text-white placeholder-gray-400 focus:outline-none ${
                  canEdit
                    ? 'bg-gray-800/50 border-gray-600 focus:border-blue-500'
                    : 'bg-gray-700/30 border-gray-700 cursor-not-allowed opacity-60'
                }`}
                placeholder="Nhập tên công việc..."
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-white font-medium mb-2">Mô tả chi tiết</label>
              <RichTextEditor
                value={formData.description}
                onChange={value => handleInputChange('description', value)}
                disabled={!canEdit}
                placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
                className="w-full"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-white font-medium mb-2">Mức độ ưu tiên</label>
              <select
                value={formData.priority}
                onChange={e => handleInputChange('priority', e.target.value)}
                disabled={!canEdit}
                className={`w-full p-3 border rounded-lg text-white focus:outline-none ${
                  canEdit
                    ? 'bg-gray-800/50 border-gray-600 focus:border-blue-500'
                    : 'bg-gray-700/30 border-gray-700 cursor-not-allowed opacity-60'
                }`}
              >
                <option value="low">Thấp</option>
                <option value="normal">Bình thường</option>
                <option value="high">Cao</option>
              </select>
            </div>

            {/* Status & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={e => handleInputChange('status', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full p-3 border rounded-lg text-white focus:outline-none ${
                    canEdit
                      ? 'bg-gray-800/50 border-gray-600 focus:border-blue-500'
                      : 'bg-gray-700/30 border-gray-700 cursor-not-allowed opacity-60'
                  }`}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Ngày hoàn thành</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={e => handleInputChange('dueDate', e.target.value)}
                  disabled={!canEdit}
                  className={`w-full p-3 border rounded-lg text-white focus:outline-none ${
                    canEdit
                      ? 'bg-gray-800/50 border-gray-600 focus:border-blue-500'
                      : 'bg-gray-700/30 border-gray-700 cursor-not-allowed opacity-60'
                  }`}
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions - Sticky footer luôn visible */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-t border-gray-700/50 bg-[#1a1f2e]">
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              {canEdit ? 'Hủy' : 'Đóng'}
            </button>
            {canEdit && (
              <button
                type="submit"
                form="edit-task-form"
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm sm:text-base"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                Lưu thay đổi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
