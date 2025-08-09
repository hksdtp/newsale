import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getLocationColors, getLocationIcon } from '../../../../../constants/locationIcons';
import { authService } from '../../../api/authService';

export function TeamSelectionPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = searchParams.get('location') || '';

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setIsLoading(true);
        const teamsData = await authService.getTeamsByLocation(location);

        // Sort teams by numeric order if they contain numbers
        const sortedTeams = teamsData.sort((a, b) => {
          // Extract numbers from team names (e.g., "Nhóm 1" => 1)
          const getNumber = (name: string) => {
            const match = name.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };

          const numA = getNumber(a.name);
          const numB = getNumber(b.name);

          // If both have numbers, sort numerically
          if (numA && numB) {
            return numA - numB;
          }

          // Otherwise, sort alphabetically
          return a.name.localeCompare(b.name);
        });

        setTeams(sortedTeams);
      } catch (error) {
        console.error('Failed to load teams:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (location) {
      loadTeams();
    }
  }, [location]);

  const handleTeamSelect = (teamId: string) => {
    if (isAnimating) return;

    setSelectedTeam(teamId);
    setIsAnimating(true);

    setTimeout(() => {
      navigate(`/auth/user-selection?location=${encodeURIComponent(location)}&teamId=${teamId}`);
    }, 600);
  };

  const handleBack = () => {
    navigate('/');
  };

  const getTeamLocationIcon = (location: string) => {
    return getLocationIcon(location as 'Hà Nội' | 'Hồ Chí Minh');
  };

  const getTeamLocationColor = (location: string) => {
    const colors = getLocationColors(location as 'Hà Nội' | 'Hồ Chí Minh');
    return { gradient: colors.gradient, hover: colors.hover };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải danh sách nhóm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Quay lại
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Location Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl font-medium text-gray-900 mb-2 animate-slide-down">
              Khu vực {location}
            </h1>
            <p className="text-gray-600 animate-fade-in animate-stagger-1">Chọn nhóm của bạn</p>
          </div>

          {/* Teams List with enhanced animations */}
          {teams.length > 0 ? (
            <div className="space-y-4">
              {teams.map((team, index) => (
                <button
                  key={team.id}
                  className={`
                    w-full p-6 text-left bg-white border border-gray-200 rounded-lg
                    interactive-scale interactive-lift
                    hover:border-blue-300 hover:bg-blue-50
                    transition-all-smooth focus-ring
                    animate-slide-up
                    ${
                      selectedTeam === team.id
                        ? 'border-blue-500 bg-blue-50 scale-[1.02] shadow-lg'
                        : 'shadow-sm'
                    }
                    ${isAnimating && selectedTeam !== team.id ? 'opacity-30 scale-95' : ''}
                    ${isAnimating && selectedTeam === team.id ? 'border-blue-600 bg-blue-100' : ''}
                  `}
                  style={{
                    animationDelay: `${index * 150}ms`,
                  }}
                  onClick={() => handleTeamSelect(team.id)}
                  disabled={isAnimating}
                >
                  <div className="flex items-center relative">
                    {/* Content */}
                    <div className="flex-1 transition-transform-smooth">
                      <h3 className="text-lg font-medium text-gray-900 mb-1 transition-colors-smooth">
                        {team.name}
                      </h3>
                      <p className="text-sm text-gray-500 transition-colors-smooth">{location}</p>
                    </div>

                    {/* Arrow with enhanced animation */}
                    <div
                      className={`
                      text-gray-400 transition-all-smooth
                      ${
                        selectedTeam === team.id
                          ? 'text-blue-600 transform rotate-90 scale-110'
                          : 'group-hover:text-blue-600 group-hover:translate-x-1'
                      }
                    `}
                    >
                      <svg
                        className="w-5 h-5 transition-transform-smooth"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="text-gray-400 mb-4 animate-float">
                <svg
                  className="w-12 h-12 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhóm nào</h3>
              <p className="text-gray-600 text-sm">
                Hiện tại chưa có nhóm nào tại khu vực {location}
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
      <footer className="p-6">{/* Empty footer for spacing */}</footer>
    </div>
  );
}
