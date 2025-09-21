import { AlertTriangle, Building, Calendar, CheckCircle, Clock, Plus, X } from 'lucide-react';
import React, { useState } from 'react';
import { WorkType } from '../data/dashboardMockData';
import { Employee, employeeService } from '../services/employeeService';
import { getTodayDateString } from '../utils/dateUtils';
import DatePicker from './DatePicker';
import Dropdown from './Dropdown';
import RichTextEditor from './RichTextEditor';
import ShareScopeSelector from './ShareScopeSelector';
import TagUserInput from './TagUserInput';
import WorkTypeDropdown from './WorkTypeDropdown';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>; // 🔧 Make onSubmit async to handle properly
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false); // 🆕 Track form submission state

  // All hooks must be declared before any conditional returns
  // Helper function để tạo ngày mặc định
  const getDefaultStartDate = () => {
    // Logic ngày mặc định:
    // - Công việc mới: Ngày bắt đầu = ngày hôm nay
    // - Công việc con (từ checklist): Ngày tạo = ngày hôm đó (được set trong TaskList.tsx)
    return getTodayDateString();
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workTypes: [] as WorkType[],
    priority: 'normal' as 'low' | 'normal' | 'high',
    status: 'new-requests' as 'new-requests' | 'approved' | 'live',
    startDate: getDefaultStartDate(), // Ngày bắt đầu = hôm nay
    dueDate: '', // Hạn chót để trống, user tự chọn
    taggedUsers: [] as any[], // For all users (unified functionality)
    department: 'HN' as 'HN' | 'HCM', // Default to HN, will be updated when user data loads
    platform: [] as string[],
    campaignType: '',
    shareScope: 'team' as 'team' | 'private' | 'public',
    autoPinToCalendar: true, // 🆕 Mặc định bật auto-pin
  });

  const statusOptions = [
    { value: 'new-requests', label: 'Chưa tiến hành', color: 'bg-yellow-500', icon: Clock },
    { value: 'approved', label: 'Đang tiến hành', color: 'bg-blue-500', icon: AlertTriangle },
    { value: 'live', label: 'Đã hoàn thành', color: 'bg-green-500', icon: CheckCircle },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Thấp', color: 'bg-green-500' },
    { value: 'normal', label: 'Bình thường', color: 'bg-yellow-500' },
    { value: 'high', label: 'Cao', color: 'bg-red-500' },
  ];

  // Load current user and assignable users
  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true);
        const user = await employeeService.getCurrentEmployee();
        if (user) {
          setCurrentUser(user);

          // Update form data with user's default department
          const defaultDept = user.location === 'Hà Nội' ? 'HN' : 'HCM';
          setFormData(prev => ({
            ...prev,
            department: defaultDept,
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadUserData();
    }
  }, [isOpen]);

  // Don't render if modal is closed
  if (!isOpen) {
    return null;
  }

  // Show loading state while fetching user data
  if (loading || !currentUser) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-[#1a1f2e] rounded-lg sm:rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-700/50">
          <div className="p-6 sm:p-8 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-400 text-sm sm:text-base">Đang tải thông tin người dùng...</p>
          </div>
        </div>
      </div>
    );
  }

  const isDirector = currentUser.role === 'retail_director';

  const handleWorkTypeChange = (workTypes: string[]) => {
    setFormData(prev => ({
      ...prev,
      workTypes: workTypes as WorkType[],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🚀 CreateTaskModal.handleSubmit STARTED');
    console.log('📊 Initial submitting state:', submitting);

    if (!currentUser) {
      console.error('❌ No current user found');
      return;
    }

    if (submitting) {
      console.log('⚠️ Already submitting, preventing double submission');
      return; // 🔒 Prevent double submission
    }

    try {
      console.log('🔄 Setting submitting to TRUE');
      setSubmitting(true); // 🔄 Set submitting state

      // Ensure workType is properly set
      const workType = formData.workTypes.length > 0 ? formData.workTypes[0] : 'other';
      console.log('📝 Prepared task data with workType:', workType);

      // 🔄 Wait for onSubmit to complete before closing modal
      console.log('🎯 About to call onSubmit...');
      await onSubmit({
        ...formData,
        workTypes: formData.workTypes, // Pass array for compatibility
        workType: workType, // Pass single work type as string
        id: `task-${Date.now()}`,
        createdBy: { id: currentUser.id, name: currentUser.name, email: currentUser.email },
        assignedTo: formData.taggedUsers.length > 0 ? formData.taggedUsers[0] : null,
        endDate: formData.dueDate,
        autoPinToCalendar: formData.autoPinToCalendar, // 🆕 Truyền auto-pin option
      });

      console.log('✅ onSubmit completed successfully');
      // ✅ Only reset and close after successful submission
      console.log('🔄 About to reset and close modal...');
      handleReset();
      onClose();
      console.log('✅ Modal reset and closed');
    } catch (error) {
      console.error('❌ CATCH BLOCK - Error submitting task:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      // Don't close modal on error, let user try again
    } finally {
      console.log('🔄 FINALLY BLOCK - Resetting submitting state...');
      console.log('📊 submitting before reset:', submitting);
      setSubmitting(false); // 🔄 Reset submitting state
      console.log('✅ FINALLY BLOCK - submitting set to FALSE');
      console.log('🏁 CreateTaskModal.handleSubmit COMPLETED');
    }
  };

  const handleReset = () => {
    if (!currentUser) return;

    const defaultDept = currentUser.location === 'Hà Nội' ? 'HN' : 'HCM';
    setFormData({
      name: '',
      description: '',
      workTypes: [],
      priority: 'normal',
      status: 'new-requests',
      startDate: getDefaultStartDate(), // Reset về ngày hôm nay
      dueDate: '',
      taggedUsers: [],
      department: defaultDept,
      platform: [],
      campaignType: '',
      shareScope: 'team',
      autoPinToCalendar: true, // 🆕 Reset về mặc định bật
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-[#1a1f2e] rounded-lg sm:rounded-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl border border-gray-700/50 flex flex-col mx-2 sm:mx-0">
        {/* Header - Flex-shrink-0 để không bị co lại */}
        <div className="flex-shrink-0 p-3 sm:p-4 md:p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-semibold text-white truncate">
                  Tạo công việc mới
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                  Tạo và quản lý công việc hiệu quả
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
            id="create-task-form"
            onSubmit={handleSubmit}
            className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6"
          >
            <WorkTypeDropdown
              label="Danh mục công việc"
              value={formData.workTypes}
              onChange={handleWorkTypeChange}
              placeholder="Chọn danh mục công việc"
              required
            />

            <div>
              <label className="block text-white font-medium mb-2">
                Tiêu đề công việc <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tiêu đề công việc..."
                className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Mô tả chi tiết <span className="text-red-400">*</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={value => setFormData({ ...formData, description: value })}
                placeholder="Mô tả chi tiết về công việc, yêu cầu, mục tiêu..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Dropdown
                label="Trạng thái"
                value={formData.status}
                onChange={value => setFormData({ ...formData, status: value as any })}
                options={statusOptions}
                placeholder="Chọn trạng thái"
              />

              <Dropdown
                label="Mức độ ưu tiên"
                value={formData.priority}
                onChange={value => setFormData({ ...formData, priority: value as any })}
                options={priorityOptions}
                placeholder="Chọn mức độ ưu tiên"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker
                label="Ngày thực hiện"
                value={formData.startDate}
                onChange={date => setFormData({ ...formData, startDate: date })}
                placeholder="Chọn ngày thực hiện"
                required
              />

              <DatePicker
                label="Hạn chót"
                value={formData.dueDate}
                onChange={date => setFormData({ ...formData, dueDate: date })}
                placeholder="Chọn hạn chót"
                minDate={formData.startDate}
              />
            </div>

            {/* Chi nhánh - Chỉ hiển thị cho Khổng Đức Mạnh và Nguyễn Hải Ninh (Giám đốc) */}
            {isDirector && (
              <div>
                <Dropdown
                  label="Chi nhánh"
                  value={formData.department}
                  onChange={value =>
                    setFormData({
                      ...formData,
                      department: value as 'HN' | 'HCM',
                      taggedUsers: [], // Clear tagged users when changing department
                    })
                  }
                  options={[
                    { value: 'HN', label: 'Hà Nội', icon: Building },
                    { value: 'HCM', label: 'Hồ Chí Minh', icon: Building },
                  ]}
                  placeholder="Chọn chi nhánh (tùy chọn)"
                />
                <p className="text-gray-400 text-sm mt-1">
                  Tùy chọn - Chỉ chọn khi cần giao việc cho chi nhánh cụ thể
                </p>
              </div>
            )}

            {/* Tag Users Section - Unified for all users */}
            <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50">
              <TagUserInput
                label="Thêm người cùng làm việc"
                value={formData.taggedUsers}
                onChange={users => setFormData({ ...formData, taggedUsers: users })}
                placeholder="Nhập tên để thêm đồng nghiệp cùng làm việc..."
                currentUserId={currentUser.id}
                currentUserLocation={
                  isDirector
                    ? formData.department
                      ? formData.department === 'HN'
                        ? 'Hà Nội'
                        : 'Hồ Chí Minh'
                      : currentUser.location
                    : currentUser.location
                }
              />
              <div className="text-gray-400 text-xs mt-2">
                {isDirector
                  ? formData.department
                    ? `Chỉ hiển thị nhân viên tại ${formData.department === 'HN' ? 'Hà Nội' : 'Hồ Chí Minh'}`
                    : `Chỉ hiển thị nhân viên tại ${currentUser.location} (chưa chọn chi nhánh)`
                  : `Chỉ hiển thị nhân viên tại ${currentUser.location}`}
              </div>
            </div>

            {/* Facebook-style Share Scope */}
            <ShareScopeSelector
              value={formData.shareScope}
              onChange={value => setFormData({ ...formData, shareScope: value })}
              label="Phạm vi chia sẻ"
              required
            />

            {/* 🆕 Auto-pin to Calendar Option - ALWAYS VISIBLE */}
            <div
              className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/50 !block"
              style={{ display: 'block', visibility: 'visible' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <label className="text-white font-medium text-base">
                      Ghim vào Lịch Kế Hoạch
                    </label>
                    <p className="text-gray-400 text-sm mt-1">
                      Tự động hiển thị công việc này trong Menu Kế Hoạch theo ngày tạo
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoPinToCalendar}
                    onChange={e =>
                      setFormData({ ...formData, autoPinToCalendar: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-12 h-7 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-blue-500 shadow-lg"></div>
                  <span className="ml-3 text-sm text-gray-300 font-medium">
                    {formData.autoPinToCalendar ? 'BẬT' : 'TẮT'}
                  </span>
                </label>
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
              Hủy bỏ
            </button>
            <button
              type="submit"
              form="create-task-form"
              disabled={submitting} // 🔒 Disable button while submitting
              className={`w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-lg text-sm sm:text-base ${
                submitting
                  ? 'bg-gray-600 cursor-not-allowed opacity-75' // 🔄 Loading state styling
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white hover:shadow-xl transform hover:scale-[1.02]'
              }`}
            >
              {submitting ? (
                <>
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Tạo công việc</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
