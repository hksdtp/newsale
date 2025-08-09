import { Camera, ChevronRight, Lock, LogOut, Mail, Settings, User, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentUser } from '../data/usersMockData';
import ChangeAvatarModal from './ChangeAvatarModal';
import ChangeEmailModal from './ChangeEmailModalNew';
import ChangePasswordModal from './ChangePasswordModalNew';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigate: (tab: string) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onLogout, onNavigate }) => {
  const [activeSection, setActiveSection] = useState<'main' | 'settings' | 'hr'>('main');
  const [isAnimating, setIsAnimating] = useState(false);

  // Modal states
  const [showChangeAvatarModal, setShowChangeAvatarModal] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Handle animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    }
  }, [isOpen]);

  // Safe user data retrieval
  const getUserData = () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }

      // Try getCurrentUser as fallback
      return getCurrentUser();
    } catch (error) {
      console.error('❌ Error getting current user in ProfileModal:', error);
      return {
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee',
        location: 'Hà Nội',
      };
    }
  };

  const user = getUserData();
  console.log('🔧 ProfileModal isOpen:', isOpen, 'user:', user.name);
  console.log('🔧 Modal states:', {
    showChangePasswordModal,
    showChangeEmailModal,
    showChangeAvatarModal,
  });

  if (!isOpen) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'retail_director':
        return 'Giám đốc';
      case 'team_leader':
        return 'Trưởng nhóm';
      case 'employee':
        return 'Nhân viên';
      default:
        return 'Người dùng';
    }
  };

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const renderMainSection = () => (
    <div className="space-y-4">
      {/* User Profile Section */}
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-center gap-4">
          {/* Large Avatar */}
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {getAvatarInitials(user.name)}
            </div>
            {/* Camera Icon for Avatar Change */}
            <button
              onClick={() => setShowChangeAvatarModal(true)}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors hover:scale-110"
              title="Đổi avatar"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* User Details */}
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{user.name}</h3>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium">
                {getRoleDisplayName(user.role)}
              </span>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium">
                {user.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-2">
        {/* HR Management - Only for directors and team leaders */}
        {(user.role === 'retail_director' || user.role === 'team_leader') && (
          <button
            onClick={() => handleNavigation('hr')}
            className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Quản lý Nhân viên</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}

        {/* Settings */}
        <button
          onClick={() => setActiveSection('settings')}
          className="w-full flex items-center justify-between p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <span className="text-white font-medium">Cài đặt</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400 font-medium">Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  const renderSettingsSection = () => (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={() => setActiveSection('main')}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span>Quay lại</span>
      </button>

      {/* Settings Items */}
      <div className="space-y-2">
        <button
          onClick={() => {
            console.log('🔐 Change password button clicked');
            setShowChangePasswordModal(true);
          }}
          className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg transition-colors touch-manipulation"
        >
          <Lock className="w-5 h-5 text-yellow-400" />
          <span className="text-white">Đổi mật khẩu</span>
        </button>

        <button
          onClick={() => {
            console.log('📧 Change email button clicked');
            setShowChangeEmailModal(true);
          }}
          className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg transition-colors touch-manipulation"
        >
          <Mail className="w-5 h-5 text-blue-400" />
          <span className="text-white">Đổi email</span>
        </button>

        <button
          onClick={() => {
            console.log('📷 Change avatar button clicked');
            setShowChangeAvatarModal(true);
          }}
          className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg transition-colors touch-manipulation"
        >
          <Camera className="w-5 h-5 text-purple-400" />
          <span className="text-white">Đổi avatar</span>
        </button>

        <button
          onClick={() => {
            alert(
              'Thông tin cá nhân bao gồm:\n\n• Họ và tên\n• Email\n• Số điện thoại\n• Địa chỉ\n• Ngày sinh\n• Giới tính\n• Phòng ban\n• Chức vụ\n• Ngày vào làm\n• Trạng thái làm việc'
            );
          }}
          className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          <User className="w-5 h-5 text-green-400" />
          <span className="text-white">Thông tin cá nhân</span>
        </button>
      </div>
    </div>
  );

  const renderHRSection = () => (
    <div className="space-y-4">
      {/* Back Button */}
      <button
        onClick={() => setActiveSection('main')}
        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span>Quay lại</span>
      </button>

      {/* HR Management Info */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Quản lý Nhân viên</h3>
        <p className="text-gray-400 text-sm">
          Chức năng này cho phép bạn quản lý thông tin nhân viên, phân quyền và theo dõi hiệu suất
          làm việc.
        </p>
      </div>

      {/* Navigate to HR Tab */}
      <button
        onClick={() => handleNavigation('hr')}
        className="w-full flex items-center justify-between p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors border border-green-500/30"
      >
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-green-400" />
          <span className="text-white font-medium">Mở trang Quản lý Nhân viên</span>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );

  return createPortal(
    <div className="profile-modal-container md:hidden" style={{ zIndex: 999999 }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        style={{ zIndex: 999998 }}
      />

      {/* Modal */}
      <div
        className={`profile-modal-content bg-gray-800/95 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border border-gray-600/50 transform transition-all duration-300 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ zIndex: 999999 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600/50">
          <h2 className="text-xl font-semibold text-white">
            {activeSection === 'main'
              ? 'Tài khoản'
              : activeSection === 'settings'
                ? 'Cài đặt'
                : 'Quản lý Nhân viên'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-8 overflow-y-auto max-h-[calc(75vh-120px)]">
          {activeSection === 'main' && renderMainSection()}
          {activeSection === 'settings' && renderSettingsSection()}
          {activeSection === 'hr' && renderHRSection()}
        </div>
      </div>

      {/* Change Avatar Modal */}
      <ChangeAvatarModal
        isOpen={showChangeAvatarModal}
        onClose={() => setShowChangeAvatarModal(false)}
        onSuccess={() => {
          setShowChangeAvatarModal(false);
          // Optionally refresh user data or show success message
        }}
      />

      {/* Change Email Modal */}
      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        onSuccess={() => {
          setShowChangeEmailModal(false);
          // Optionally refresh user data or show success message
        }}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          setShowChangePasswordModal(false);
          // Optionally refresh user data or show success message
        }}
      />
    </div>,
    document.body
  );
};

export default ProfileModal;
