import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService, User } from '../../../api/authService';

export function UserSelectionPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';
  const teamId = searchParams.get('teamId') || '';

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const usersList = await authService.getUsersByTeamAndLocation(teamId, location);

        // Sort users: team_leader first, then employees
        const sortedUsers = usersList.sort((a, b) => {
          if (a.role === 'team_leader' && b.role !== 'team_leader') return -1;
          if (a.role !== 'team_leader' && b.role === 'team_leader') return 1;
          return a.name.localeCompare(b.name);
        });

        setUsers(sortedUsers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách thành viên');
      } finally {
        setIsLoading(false);
      }
    };

    if (location && teamId) {
      loadUsers();
    }
  }, [location, teamId]);

  const handleSelectUser = (email: string) => {
    if (isAnimating) return;

    const user = users.find(u => u.email === email);
    if (!user) return;

    setSelectedUser(email);
    setIsAnimating(true);

    setTimeout(() => {
      navigate(`/auth/password?email=${encodeURIComponent(email)}&name=${encodeURIComponent(user.name)}`);
    }, 600);
  };

  const handleBack = () => {
    navigate(`/auth/team-selection?location=${encodeURIComponent(location)}`);
  };

  const getLocationColor = (location: string) => {
    return location === 'Hà Nội'
      ? { gradient: 'from-blue-600 to-blue-800', hover: 'hover:from-blue-700 hover:to-blue-900' }
      : { gradient: 'from-green-600 to-green-800', hover: 'hover:from-green-700 hover:to-green-900' };
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'team_leader': return '👑';
      case 'employee': return '👤';
      default: return '👤';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'team_leader': return 'Trưởng nhóm';
      case 'employee': return 'Nhân viên';
      default: return 'Nhân viên';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách thành viên...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lỗi kết nối</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const teamName = users[0]?.team?.name || 'Nhóm';
  const teamLeader = users.find(user => user.role === 'team_leader');
  const displayName = teamLeader ? teamLeader.name : teamName;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Team Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              {displayName}
            </h1>
            <p className="text-gray-600">
              {location} • Chọn tài khoản của bạn
            </p>
          </div>

          {/* Users List */}
          {users.length > 0 ? (
            <div className="space-y-3">
              {users.map((user, index) => (
                <button
                  key={user.id}
                  className={`
                    w-full p-4 text-left bg-white border border-gray-200 rounded-lg
                    hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 ease-in-out
                    transform hover:scale-[1.02] active:scale-[0.98]
                    ${selectedUser === user.email
                      ? 'border-blue-500 bg-blue-50 scale-[1.02]'
                      : ''
                    }
                    ${isAnimating && selectedUser !== user.email
                      ? 'opacity-50'
                      : ''
                    }
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                  onClick={() => handleSelectUser(user.email)}
                  disabled={isAnimating}
                >
                  <div className="flex items-center">
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {user.email}
                      </p>
                      <div className="flex items-center mt-1 text-xs">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          user.role === 'team_leader'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getRoleName(user.role)}
                        </span>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className={`
                      flex-shrink-0 text-gray-400 transition-all duration-200
                      ${selectedUser === user.email
                        ? 'text-blue-600 transform rotate-90'
                        : 'group-hover:text-blue-600'
                      }
                    `}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">😔</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Không tìm thấy thành viên nào
              </h3>
              <p className="text-gray-600 text-sm">
                Hiện tại chưa có thành viên nào trong nhóm này
              </p>
            </div>
          )}

          {/* Loading State */}
          {isAnimating && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                <span className="text-gray-700 text-sm">Đang chuyển hướng...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6">
        {/* Empty footer for spacing */}
      </footer>
    </div>
  );
}
