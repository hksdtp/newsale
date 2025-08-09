import React, { useEffect, useState } from 'react';
import { Team, teamsService } from '../services/teamsService';

interface TeamSelectorProps {
  location: 'Hà Nội' | 'Hồ Chí Minh';
  selectedTeamId?: string;
  onTeamSelect: (teamId: string, teamName: string) => void;
  className?: string;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({
  location,
  selectedTeamId,
  onTeamSelect,
  className = '',
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [location]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const teamsData = await teamsService.getTeamsByLocation(location);
      setTeams(teamsData);
    } catch (error) {
      console.error('❌ Error loading teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="px-4 py-2 bg-gray-700 rounded-lg animate-pulse">
              <div className="h-4 bg-gray-600 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p>Không có nhóm nào tại {location}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white mb-2">Chọn nhóm tại {location}</h3>
        <p className="text-sm text-gray-400">
          Click vào nhóm để xem thống kê chi tiết của các thành viên
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {teams.map(team => {
          const isSelected = selectedTeamId === team.id;

          return (
            <button
              key={team.id}
              onClick={() => onTeamSelect(team.id, team.name)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                  : 'border-gray-600 bg-gray-800 hover:border-gray-500 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div
                    className={`w-3 h-3 rounded-full mr-2 ${
                      isSelected ? 'bg-blue-400' : 'bg-gray-500'
                    }`}
                  ></div>
                  <span className={`font-medium ${isSelected ? 'text-blue-300' : 'text-white'}`}>
                    {team.name}
                  </span>
                </div>
                {isSelected && <span className="text-blue-400">✓</span>}
              </div>

              <div className="text-xs text-gray-400">
                {team.leader?.name ? (
                  <span>Trưởng nhóm: {team.leader.name}</span>
                ) : (
                  <span>Chưa có trưởng nhóm</span>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-500">📍 {team.location}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TeamSelector;
