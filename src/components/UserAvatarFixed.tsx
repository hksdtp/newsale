import { Camera, Lock, LogOut, Mail, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ChangeAvatarModal from './ChangeAvatarModal';
import ChangeEmailModal from './ChangeEmailModalNew';
import ChangePasswordModal from './ChangePasswordModalNew';

interface UserAvatarFixedProps {
  onLogout: () => void;
  className?: string;
  isCollapsed?: boolean;
}

const UserAvatarFixed: React.FC<UserAvatarFixedProps> = ({
  onLogout,
  className = '',
  isCollapsed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [activeModal, setActiveModal] = useState<'password' | 'email' | 'avatar' | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Safe user data retrieval
  const getUserData = () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }

      // Fallback user data
      return {
        name: 'Test User',
        email: 'test@example.com',
        role: 'employee',
        location: 'Hà Nội',
      };
    } catch (error) {
      console.error('❌ Error getting user data:', error);
      return {
        name: 'Unknown User',
        email: 'unknown@example.com',
        role: 'employee',
        location: 'Hà Nội',
      };
    }
  };

  const user = getUserData();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

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

  // Calculate dropdown position
  const calculateDropdownPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const dropdownWidth = 384; // w-96 = 384px
    const dropdownHeight = 400; // Estimated height

    let top = buttonRect.bottom + 8; // 8px gap below button
    let left = buttonRect.left;

    // Adjust for collapsed sidebar (show to the right)
    if (isCollapsed) {
      left = buttonRect.right + 8; // Show to the right of button
      top = buttonRect.top; // Align with button top
    } else {
      // For expanded sidebar, show above if not enough space below
      if (top + dropdownHeight > viewportHeight) {
        top = buttonRect.top - dropdownHeight - 8; // Show above
      }

      // Adjust horizontal position if dropdown would go off-screen
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 16; // 16px margin from edge
      }
    }

    // Ensure dropdown doesn't go above viewport
    if (top < 16) {
      top = 16;
    }

    // Ensure dropdown doesn't go left of viewport
    if (left < 16) {
      left = 16;
    }

    setDropdownPosition({ top, left });
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isOpen) {
      calculateDropdownPosition();
    }

    setIsOpen(!isOpen);
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Tắt menu trước khi logout
    setIsOpen(false);
    // Delay nhỏ để animation smooth
    setTimeout(() => {
      onLogout();
    }, 100);
  };

  // Recalculate position on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        calculateDropdownPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isCollapsed]);

  return (
    <>
      <div className={`relative ${className}`} ref={dropdownRef}>
        {/* Avatar Button */}
        <button
          ref={buttonRef}
          onClick={handleAvatarClick}
          className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-all duration-200 w-full ${
            isCollapsed ? 'justify-center' : ''
          } ${isOpen ? 'bg-gray-700 ring-2 ring-blue-500/50' : ''}`}
          title={isCollapsed ? user.name : undefined}
          data-testid="user-avatar-button"
        >
          {/* Avatar */}
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              getAvatarInitials(user.name)
            )}
          </div>

          {/* User Info - Hidden when collapsed */}
          {!isCollapsed && (
            <div className="text-left flex-1">
              <div className="text-white font-medium text-sm">{user.name}</div>
              <div className="text-gray-400 text-xs">{getRoleDisplayName(user.role)}</div>
            </div>
          )}
        </button>
      </div>

      {/* Dropdown Menu - Rendered as Portal */}
      {isOpen &&
        createPortal(
          <>
            {/* Backdrop - Blur background */}
            <div
              className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsOpen(false)}
              data-testid="user-avatar-backdrop"
            />

            {/* Dropdown - Positioned dynamically */}
            <div
              ref={dropdownRef}
              className="fixed w-96 max-w-[calc(100vw-2rem)] bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-[9999] max-h-[85vh] overflow-hidden animate-in slide-in-from-top-2 fade-in duration-300"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
              data-testid="user-avatar-dropdown"
            >
              {/* User Profile Section */}
              <div className="p-6 border-b border-gray-600/50">
                <div className="flex items-center gap-4">
                  {/* Large Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getAvatarInitials(user.name)
                      )}
                    </div>
                    {/* Camera Icon for Avatar Change */}
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsOpen(false);
                        setActiveModal('avatar');
                      }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-all duration-200 shadow-lg hover:scale-110"
                      title="Đổi avatar"
                    >
                      <Camera className="w-3 h-3 text-white" />
                    </button>
                  </div>

                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">{user.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20">
                        {getRoleDisplayName(user.role)}
                      </span>
                      <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs font-medium border border-green-500/20">
                        {user.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 space-y-2">
                {/* Direct Menu Options */}
                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                    setActiveModal('password');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:text-white group"
                >
                  <Lock className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
                  <span className="font-medium">Đổi mật khẩu</span>
                </button>

                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                    setActiveModal('email');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:text-white group"
                >
                  <Mail className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                  <span className="font-medium">Đổi email</span>
                </button>

                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(false);
                    setActiveModal('avatar');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:text-white group"
                >
                  <Camera className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
                  <span className="font-medium">Đổi avatar</span>
                </button>

                <button
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    // TODO: Implement profile info modal
                    alert(
                      'Thông tin cá nhân bao gồm:\n\n• Họ và tên\n• Email\n• Số điện thoại\n• Địa chỉ\n• Ngày sinh\n• Giới tính\n• Phòng ban\n• Chức vụ\n• Ngày vào làm\n• Trạng thái làm việc'
                    );
                    console.log('Profile info clicked');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:text-white group"
                >
                  <User className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                  <span className="font-medium">Thông tin cá nhân</span>
                </button>

                {/* Divider */}
                <div className="border-t border-gray-600/50 my-3"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-xl transition-all duration-200 group font-medium"
                  data-testid="logout-button"
                >
                  <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* Modals */}
      <ChangePasswordModal
        isOpen={activeModal === 'password'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          // Refresh user data or show success message
          console.log('Password changed successfully');
        }}
      />

      <ChangeEmailModal
        isOpen={activeModal === 'email'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          // Refresh user data or show success message
          console.log('Email changed successfully');
        }}
      />

      <ChangeAvatarModal
        isOpen={activeModal === 'avatar'}
        onClose={() => setActiveModal(null)}
        onSuccess={() => {
          // Refresh user data or show success message
          console.log('Avatar changed successfully');
          // Force re-render to show new avatar
          window.location.reload();
        }}
      />
    </>
  );
};

export default UserAvatarFixed;
