import React from 'react';

interface DashboardTabsProps {
  activeTab: 'personal' | 'team' | 'department' | 'locations';
  onTabChange: (tab: 'personal' | 'team' | 'department' | 'locations') => void;
  availableTabs: Array<'personal' | 'team' | 'department' | 'locations'>;
  className?: string;
}

const TAB_CONFIG = {
  personal: {
    label: 'Cá nhân',
    icon: '👤',
    description: 'Thống kê công việc cá nhân',
  },
  team: {
    label: 'Nhóm',
    icon: '👥',
    description: 'Thống kê nhóm của bạn',
  },
  department: {
    label: 'Toàn phòng',
    icon: '🏢',
    description: 'Thống kê toàn bộ phòng ban',
  },
  locations: {
    label: 'Theo khu vực',
    icon: '🗺️',
    description: 'Thống kê theo Hà Nội/HCM',
  },
};

export const DashboardTabs: React.FC<DashboardTabsProps> = ({
  activeTab,
  onTabChange,
  availableTabs,
  className = '',
}) => {
  if (availableTabs.length <= 1) {
    return null; // Không hiển thị tabs nếu chỉ có 1 tab
  }

  return (
    <div className={`border-b border-gray-700 ${className}`}>
      <nav className="flex space-x-8" aria-label="Dashboard tabs">
        {availableTabs.map(tab => {
          const config = TAB_CONFIG[tab];
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="text-base mr-2">{config.icon}</span>
              <span>{config.label}</span>
              {isActive && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                  Đang xem
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardTabs;
