import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock, User, Building, Flag, FileText, Users, Target } from 'lucide-react';
import { WORK_TYPES, WorkType } from '../data/dashboardMockData';
import { TaskWithUsers } from '../services/taskService';
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
    campaignType: ''
  });

  // Load task data when modal opens
  useEffect(() => {
    if (isOpen && task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        workTypes: task.workType ? [task.workType] : [],
        priority: task.priority || 'normal',
        status: task.status || 'new-requests',
        dueDate: task.dueDate || '',
        assignedTo: task.assignedTo?.name || '',
        department: task.department || 'HN',
        campaignType: task.campaignType || ''
      });
    }
  }, [isOpen, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    onSubmit({
      ...formData,
      id: task.id,
      workType: formData.workTypes[0] || 'other', // Use first selected work type
      startDate: task.startDate, // Keep original start date
      dueDate: formData.dueDate, // Fix: use dueDate instead of endDate
      assignedToId: task.assignedTo?.id // Keep original assigned user
    });
    onClose();
  };

  const handleWorkTypeChange = (workTypes: string[]) => {
    setFormData(prev => ({
      ...prev,
      workTypes
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };


  if (!isOpen || !task) return null;

  const statusOptions = [
    { value: 'new-requests', label: 'Chưa tiến hành' },
    { value: 'approved', label: 'Đang tiến hành' },
    { value: 'live', label: 'Đã hoàn thành' }
  ];

  return (
    <div className="fixed inset-0 modal-backdrop-enhanced modal-container-responsive z-50">
      <div className="create-task-modal bg-[#1a1f2e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-700/50 modal-animate-in">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <Save className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Chỉnh sửa công việc</h2>
                <p className="text-gray-400 text-sm mt-1">Cập nhật thông tin công việc</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="create-task-modal-content">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Work Type */}
          <WorkTypeDropdown
            label="Loại công việc"
            value={formData.workTypes}
            onChange={handleWorkTypeChange}
            placeholder="Chọn loại công việc"
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
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tên công việc..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-medium mb-2">
              Mô tả chi tiết
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-white font-medium mb-2">
              Mức độ ưu tiên
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
            </select>
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Ngày hoàn thành
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>


            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-700/50 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
