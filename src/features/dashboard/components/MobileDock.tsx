import React, { useState, useEffect, useRef } from 'react';
import {
  Home,
  Briefcase,
  Calendar,
  Users,
  Settings,
  User
} from 'lucide-react';
import { getCurrentUser } from '../../../data/usersMockData';
import ProfileModal from '../../../components/ProfileModal';

interface MobileDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isModalOpen?: boolean; // Hide dock when modals are open
  onLogout?: () => void; // Logout function for mobile
}

export function MobileDock({
  activeTab,
  onTabChange,
  isModalOpen = false,
  onLogout
}: MobileDockProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Only update if scroll difference is significant (avoid micro-scrolls)
      if (scrollDifference > 5) {
        const direction = currentScrollY > lastScrollY ? 'down' : 'up';
        setScrollDirection(direction);
        setLastScrollY(currentScrollY);

        // Clear existing timeout
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }

        // Show dock when scrolling up
        if (direction === 'up') {
          setIsVisible(true);
        } else {
          // Hide dock when scrolling down, but with a delay
          hideTimeoutRef.current = setTimeout(() => {
            setIsVisible(false);
          }, 150);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  // Hide dock when modals are open (but NOT when scrolled to bottom per requirement)
  useEffect(() => {
    if (isModalOpen || isProfileModalOpen) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [isModalOpen, isProfileModalOpen]);

  // Show dock when tab changes (user interaction)
  useEffect(() => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  }, [activeTab]);

  // Safe user retrieval with error handling
  const user = (() => {
    try {
      return getCurrentUser();
    } catch (error) {
      console.error('❌ MobileDock: Error getting current user:', error);
      // Return fallback user data
      return {
        id: 'unknown',
        name: 'Unknown User',
        email: 'unknown@email.com',
        team_id: '0',
        location: 'Hà Nội' as const,
        role: 'employee' as const,
        team: {
          id: '0',
          name: 'Unknown Team',
          location: 'HN' as const
        }
      };
    }
  })();

  const getAvatarInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      id: 'profile',
      label: 'Tài khoản',
      icon: User,
      color: 'text-purple-400',
      activeColor: 'text-purple-500',
      isProfile: true
    }
  ];

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      {/* Dock container with rounded corners and improved styling */}
      <div className="mx-4 mb-2">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-600/30 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-around px-2 py-2">
          {dockItems.map((item: any) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => item.isProfile ? setIsProfileModalOpen(true) : onTabChange(item.id)}
                className={`
                  flex flex-col items-center justify-center p-2 rounded-xl min-w-[56px] min-h-[56px]
                  transition-all duration-300 ease-out transform
                  ${isActive
                    ? 'bg-white/15 scale-105 shadow-lg shadow-black/20'
                    : 'hover:bg-white/8 hover:scale-102 active:scale-95'
                  }
                `}
              >
                {/* Icon Container or Avatar */}
                <div className={`
                  relative mb-1 transition-all duration-300
                  ${isActive ? 'scale-105' : 'group-hover:scale-102'}
                `}>
                  {item.isProfile ? (
                    // User Avatar
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {getAvatarInitials(user.name)}
                    </div>
                  ) : (
                    // Regular Icon
                    <Icon
                      className={`
                        w-5 h-5 transition-all duration-300
                        ${isActive ? `${item.activeColor} drop-shadow-lg` : `${item.color} group-hover:text-white`}
                      `}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                  )}

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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={onLogout || (() => {})}
        onNavigate={onTabChange}
      />
    </div>
  );
}
