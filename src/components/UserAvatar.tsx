import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, Lock, Mail, LogOut, Camera, ChevronDown } from 'lucide-react';
import { getCurrentUser } from '../data/usersMockData';

interface UserAvatarProps {
  onLogout: () => void;
  className?: string;
  isCollapsed?: boolean; // For sidebar collapsed state
}

const UserAvatar: React.FC<UserAvatarProps> = ({ onLogout, className = '', isCollapsed = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let user;
  try {
    user = getCurrentUser();
  } catch (error) {
    console.error('❌ Error getting current user:', error);
    user = {
      name: 'Unknown User',
      email: 'unknown@example.com',
      role: 'employee',
      location: 'Hà Nội'
    };
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleAvatarClick = () => {
    console.log('🔧 UserAvatar clicked, current isOpen:', isOpen);
    setIsOpen(!isOpen);
    setIsSettingsOpen(false);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        onClick={handleAvatarClick}
        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors w-full ${
          isCollapsed ? 'justify-center' : ''
        }`}
        title={isCollapsed ? user.name : undefined}
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
          {getAvatarInitials(user.name)}
        </div>

        {/* User Info - Hidden when collapsed */}
        {!isCollapsed && (
          <div className="text-left flex-1">
            <div className="text-white font-medium text-sm">{user.name}</div>
            <div className="text-gray-400 text-xs">{getRoleDisplayName(user.role)}</div>
          </div>
        )}

        {/* Dropdown Arrow - Hidden when collapsed */}
        {!isCollapsed && (
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`fixed ${isCollapsed ? 'left-20 bottom-4' : 'top-16 right-4'} w-80 max-w-[calc(100vw-2rem)] bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-[9999] max-h-[80vh] overflow-y-auto`}>
          {/* User Profile Section */}
          <div className="p-4 border-b border-gray-600">
            <div className="flex items-center gap-4">
              {/* Large Avatar */}
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {getAvatarInitials(user.name)}
                </div>
                {/* Camera Icon for Avatar Change */}
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
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
          <div className="p-2">
            {/* Settings Section */}
            <div className="mb-2">
              <button
                onClick={handleSettingsClick}
                className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Cài đặt</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Settings Submenu */}
              {isSettingsOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors text-sm">
                    <Lock className="w-4 h-4" />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors text-sm">
                    <Mail className="w-4 h-4" />
                    <span>Đổi email</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors text-sm">
                    <User className="w-4 h-4" />
                    <span>Thông tin cá nhân</span>
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-600 my-2"></div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:bg-red-600/20 hover:text-red-300 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/20" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default UserAvatar;
