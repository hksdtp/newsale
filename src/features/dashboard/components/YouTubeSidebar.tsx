import { Briefcase, Calendar, Home, Menu, UserCheck, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import UserAvatarFixed from '../../../components/UserAvatarFixed';
import { getCurrentUser } from '../../../data/usersMockData';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  isModalOpen?: boolean; // Hide sidebar when modals are open
}

export function YouTubeSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  isModalOpen = false,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAutoHidden, setIsAutoHidden] = useState(false); // Start expanded
  const [isHovered, setIsHovered] = useState(false);

  // Auto-hide functionality - hide when mouse leaves, show when mouse approaches
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const isNearSidebar = e.clientX <= 80; // 80px from left edge

      if (isNearSidebar && isAutoHidden && !isModalOpen) {
        setIsAutoHidden(false); // Show when mouse approaches
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isAutoHidden, isModalOpen]);

  // Handle hover to expand/collapse
  const handleMouseEnter = () => {
    setIsHovered(true);
    setIsAutoHidden(false); // Always expand on hover
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    // Don't auto-hide if modal is open or manually collapsed
    if (isModalOpen || isCollapsed) {
      return;
    }

    // Hide immediately when mouse leaves
    setIsAutoHidden(true);
  };

  // Get current user to check permissions
  const user = (() => {
    try {
      return getCurrentUser();
    } catch (error) {
      console.error('❌ YouTubeSidebar: Error getting current user:', error);
      return { name: 'Unknown User' };
    }
  })();

  const mainMenuItems = [
    {
      id: 'home',
      label: 'Trang Chủ',
      icon: <Home className="w-5 h-5" />,
    },
    {
      id: 'work',
      label: 'Công Việc',
      icon: <Briefcase className="w-5 h-5" />,
    },
    {
      id: 'plan',
      label: 'Kế Hoạch',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'customers',
      label: 'Khách Hàng',
      icon: <Users className="w-5 h-5" />,
    },
    // Only show HR menu for Khổng Đức Mạnh
    ...(user.name === 'Khổng Đức Mạnh'
      ? [
          {
            id: 'hr',
            label: 'Nhân Viên',
            icon: <UserCheck className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  const renderMenuItem = (item: any, isActive: boolean) => {
    const isIconMode = isCollapsed || isAutoHidden;

    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        } ${isIconMode ? 'justify-center' : ''}`}
        title={isIconMode ? item.label : undefined}
      >
        <span
          className={`${isActive ? 'text-white' : 'text-gray-400'} ${isIconMode ? '' : 'mr-3'}`}
        >
          {item.icon}
        </span>
        {!isIconMode && item.label}
      </button>
    );
  };

  return (
    <>
      {/* Mobile/Tablet sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 ${isCollapsed || isAutoHidden ? 'w-16' : 'w-64'} bg-gray-800 shadow-lg transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-700">
          <div className="flex items-center">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
            {!(isCollapsed || isAutoHidden) && (
              <img src="/incanto-logo.svg" alt="INCANTO" className="h-8 w-auto ml-2" />
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {/* Main Menu */}
          <div className="space-y-1">
            {mainMenuItems.map(item => renderMenuItem(item, activeTab === item.id))}
          </div>
        </nav>

        {/* Footer with UserAvatar */}
        <div className="border-t border-gray-700 p-4">
          <UserAvatarFixed
            onLogout={onLogout}
            className={`w-full ${isCollapsed || isAutoHidden ? 'flex justify-center' : ''}`}
            isCollapsed={isCollapsed || isAutoHidden}
          />
        </div>
      </div>
    </>
  );
}
