import React from 'react';
import { CategoryStats } from '../services/dashboardStatsService';

interface TeamMember {
  userId: string;
  userName: string;
  stats: CategoryStats;
}

interface TeamMembersStatsProps {
  members: TeamMember[];
  teamName: string;
  isLoading?: boolean;
  onMemberClick?: (userId: string, userName: string) => void;
}

const MemberStatCard: React.FC<{
  member: TeamMember;
  onClick?: () => void;
}> = ({ member, onClick }) => {
  const totalTasks = Object.values(member.stats).reduce((sum, count) => sum + count, 0);

  const topCategories = [
    { label: 'KTS', count: member.stats.ktsNew + member.stats.ktsOld, color: 'bg-blue-400' },
    {
      label: 'Đối tác',
      count: member.stats.partnerNew + member.stats.partnerOld,
      color: 'bg-green-400',
    },
    {
      label: 'KH',
      count: member.stats.customerNew + member.stats.customerOld,
      color: 'bg-orange-400',
    },
    { label: 'SBG', count: member.stats.sbgNew + member.stats.sbgOld, color: 'bg-purple-400' },
  ]
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div
      className={`bg-gray-800 rounded-xl p-4 border border-gray-700 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-gray-600 hover:bg-gray-750' : ''
      }`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
            {member.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">{member.userName}</h4>
            <p className="text-gray-400 text-xs">Thành viên</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{totalTasks}</div>
          <div className="text-xs text-gray-400">Tổng CV</div>
        </div>
      </div>

      {/* Stats breakdown */}
      <div className="space-y-2">
        {topCategories.map((category, index) => (
          <div key={category.label} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 ${category.color} rounded-full mr-2`}></div>
              <span className="text-xs text-gray-300">{category.label}</span>
            </div>
            <span className="text-xs text-white font-medium">{category.count}</span>
          </div>
        ))}

        {member.stats.other > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              <span className="text-xs text-gray-300">Khác</span>
            </div>
            <span className="text-xs text-white font-medium">{member.stats.other}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Hoạt động</span>
          <span>{totalTasks > 0 ? '100%' : '0%'}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className={`h-1.5 rounded-full ${totalTasks > 0 ? 'bg-blue-400' : 'bg-gray-600'}`}
            style={{ width: totalTasks > 0 ? '100%' : '0%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gray-600 rounded-full mr-3"></div>
        <div>
          <div className="h-4 bg-gray-600 rounded w-20 mb-1"></div>
          <div className="h-3 bg-gray-600 rounded w-16"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-5 bg-gray-600 rounded w-8 mb-1"></div>
        <div className="h-3 bg-gray-600 rounded w-12"></div>
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="h-3 bg-gray-600 rounded w-16"></div>
          <div className="h-3 bg-gray-600 rounded w-6"></div>
        </div>
      ))}
    </div>
  </div>
);

export const TeamMembersStats: React.FC<TeamMembersStatsProps> = ({
  members,
  teamName,
  isLoading = false,
  onMemberClick,
}) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Thống kê thành viên - {teamName}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Thống kê thành viên - {teamName}</h3>
        <div className="text-center py-8 text-gray-400">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👥</span>
          </div>
          <p>Nhóm này chưa có thành viên nào</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Thống kê thành viên - {teamName}</h3>
        <div className="text-sm text-gray-400">{members.length} thành viên</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {members.map(member => (
          <MemberStatCard
            key={member.userId}
            member={member}
            onClick={
              onMemberClick ? () => onMemberClick(member.userId, member.userName) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default TeamMembersStats;
