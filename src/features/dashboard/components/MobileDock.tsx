import { Briefcase, Calendar, Home, User, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileModal from '../../../components/ProfileModal';
import { getCurrentUser } from '../../../data/usersMockData';

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
  onLogout,
}: MobileDockProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll direction detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      // Check if user is near bottom of page
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrolledToBottom = currentScrollY + windowHeight >= documentHeight - 50; // 50px threshold

      // Only update if scroll difference is significant (avoid micro-scrolls)
      if (scrollDifference > 3) {
        const direction = currentScrollY > lastScrollY ? 'down' : 'up';
        setScrollDirection(direction);
        setLastScrollY(currentScrollY);

        // Clear existing timeouts
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
        }
        if (showTimeoutRef.current) {
          clearTimeout(showTimeoutRef.current);
        }

        // Scroll down → Ẩn dock (kể cả ở cuối trang)
        if (direction === 'down') {
          setIsVisible(false);
        }
        // Scroll up → Hiện dock
        else if (direction === 'up') {
          setIsVisible(true);
        }

        // Dừng scroll → Dock tự hiện (accessibility) - sau 1.5 giây
        showTimeoutRef.current = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  // Hide dock when modals are open
  useEffect(() => {
    if (isModalOpen || isProfileModalOpen) {
      setIsVisible(false);
    } else {
      // Chỉ hiện dock khi không có modal và không đang scroll down
      if (scrollDirection === 'up' || lastScrollY === 0) {
        setIsVisible(true);
      }
    }
  }, [isModalOpen, isProfileModalOpen, scrollDirection, lastScrollY]);

  // Show dock when tab changes (user interaction)
  useEffect(() => {
    setIsVisible(true);
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
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
          location: 'HN' as const,
        },
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
      activeColor: 'text-blue-500',
    },
    {
      id: 'work',
      label: 'Công Việc',
      icon: Briefcase,
      color: 'text-green-400',
      activeColor: 'text-green-500',
    },
    {
      id: 'plan',
      label: 'Kế Hoạch',
      icon: Calendar,
      color: 'text-purple-400',
      activeColor: 'text-purple-500',
    },
    {
      id: 'customers',
      label: 'Khách Hàng',
      icon: Users,
      color: 'text-orange-400',
      activeColor: 'text-orange-500',
    },

    {
      id: 'profile',
      label: 'Tài khoản',
      icon: User,
      color: 'text-purple-400',
      activeColor: 'text-purple-500',
      isProfile: true,
    },
  ];

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{
        // Đảm bảo dock hoàn toàn ẩn khỏi viewport khi scroll down
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Dock container with rounded corners and improved styling */}
      <div className="mx-3 mb-1">
        <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-600/30 rounded-xl shadow-2xl">
          <div className="flex items-center justify-around px-1 py-1">
            {dockItems.map((item: any) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() =>
                    item.isProfile ? setIsProfileModalOpen(true) : onTabChange(item.id)
                  }
                  className={`
                  flex flex-col items-center justify-center p-1 rounded-lg min-w-[40px] min-h-[40px]
                  transition-all duration-300 ease-out transform
                  ${
                    isActive
                      ? 'bg-white/15 scale-105 shadow-lg shadow-black/20'
                      : 'hover:bg-white/8 hover:scale-102 active:scale-95'
                  }
                `}
                >
                  {/* Icon Container or Avatar */}
                  <div
                    className={`
                  relative mb-0.5 transition-all duration-300
                  ${isActive ? 'scale-105' : 'group-hover:scale-102'}
                `}
                  >
                    {item.isProfile ? (
                      // User Avatar
                      <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {getAvatarInitials(user.name)}
                      </div>
                    ) : (
                      // Regular Icon
                      <Icon
                        className={`
                        w-4 h-4 transition-all duration-300
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
                  <span
                    className={`
                  text-xs font-medium transition-all duration-300
                  ${
                    isActive
                      ? 'text-white scale-102 font-semibold'
                      : 'text-gray-400 group-hover:text-gray-200'
                  }
                `}
                  >
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
