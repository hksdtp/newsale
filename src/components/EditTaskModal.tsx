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
    platform: [] as string[],
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
        platform: task.platform || [],
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
      endDate: formData.dueDate
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

  const handlePlatformChange = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platform: prev.platform.includes(platform)
        ? prev.platform.filter(p => p !== platform)
        : [...prev.platform, platform]
    }));
  };

  if (!isOpen || !task) return null;

  const platformOptions = ['Google Ads', 'Facebook', 'LinkedIn', 'Twitter', 'Instagram', 'TikTok', 'YouTube'];
  const statusOptions = [
    { value: 'new-requests', label: 'Chưa tiến hành' },
    { value: 'approved', label: 'Đang tiến hành' },
    { value: 'live', label: 'Đã hoàn thành' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Save className="w-5 h-5" />
            Chỉnh sửa công việc
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Tên công việc *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tên công việc..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
              placeholder="Mô tả chi tiết công việc..."
            />
          </div>

          {/* Work Type */}
          <WorkTypeDropdown
            label="Loại công việc"
            value={formData.workTypes}
            onChange={handleWorkTypeChange}
            placeholder="Chọn loại công việc"
            required
          />

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Flag className="w-4 h-4 inline mr-2" />
              Mức độ ưu tiên
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="low">Thấp</option>
              <option value="normal">Bình thường</option>
              <option value="high">Cao</option>
            </select>
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Trạng thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Ngày hoàn thành
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Nền tảng
            </label>
            <div className="grid grid-cols-3 gap-2">
              {platformOptions.map(platform => (
                <label key={platform} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.platform.includes(platform)}
                    onChange={() => handlePlatformChange(platform)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTaskModal;
