import React from 'react';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  Users, 
  Settings
} from 'lucide-react';

interface MobileDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MobileDock({ activeTab, onTabChange }: MobileDockProps) {
  const dockItems = [
    {
      id: 'home',
      label: 'Trang Chủ',
      icon: Home,
      color: 'text-blue-400',
      activeColor: 'text-blue-500'
    },
    {
      id: 'work',
      label: 'Công Việc',
      icon: Briefcase,
      color: 'text-green-400',
      activeColor: 'text-green-500'
    },
    {
      id: 'plan',
      label: 'Kế Hoạch',
      icon: Calendar,
      color: 'text-purple-400',
      activeColor: 'text-purple-500'
    },
    {
      id: 'customers',
      label: 'Khách Hàng',
      icon: Users,
      color: 'text-orange-400',
      activeColor: 'text-orange-500'
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: Settings,
      color: 'text-gray-400',
      activeColor: 'text-gray-300'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Dock container with rounded corners and improved styling */}
      <div className="mx-4 mb-2">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
          {dockItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[56px]
                  transition-all duration-300 ease-out transform
                  ${isActive 
                    ? 'bg-white/15 scale-105 shadow-lg shadow-black/20' 
                    : 'hover:bg-white/8 hover:scale-102 active:scale-95'
                  }
                `}
              >
                {/* Icon Container */}
                <div className={`
                  relative mb-1 transition-all duration-300
                  ${isActive ? 'scale-105' : 'group-hover:scale-102'}
                `}>
                  <Icon 
                    className={`
                      w-5 h-5 transition-all duration-300
                      ${isActive ? `${item.activeColor} drop-shadow-lg` : `${item.color} group-hover:text-white`}
                    `}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg" />
                  )}
                </div>
                
                {/* Label */}
                <span className={`
                  text-xs font-medium transition-all duration-300
                  ${isActive 
                    ? 'text-white scale-102 font-semibold' 
                    : 'text-gray-400 group-hover:text-gray-200'
                  }
                `}>
                  {item.label}
                </span>
              </button>
            );
          })}
          </div>
        </div>
      </div>
      {/* Safe area padding for iOS devices */}
      <div className="h-safe"></div>
    </div>
  );
}
