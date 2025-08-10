import React from 'react';
import { CategoryStats } from '../services/dashboardStatsService';

interface DashboardStatsCardsProps {
  stats: CategoryStats;
  title: string;
  isLoading?: boolean;
}

interface StatCardProps {
  title: string;
  newCount: number;
  oldCount: number;
  total: number;
  color: string;
  icon: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, newCount, oldCount, total, color }) => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</h3>
      <div className={`w-2 h-2 ${color} rounded-full`}></div>
    </div>
    <div className="flex items-baseline space-x-2 mb-2">
      <span className="text-3xl font-bold text-white">{total}</span>
      <span className="text-sm text-gray-400">Tổng</span>
    </div>
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-xs text-green-400">
        {total > 0 ? '↑' : '→'} {total > 0 ? '100%' : '0%'}
      </span>
      <span className="text-xs text-gray-400">hoạt động</span>
    </div>
    {/* Mini Chart */}
    <div className="h-8 flex items-end space-x-1">
      <div className={`w-2 ${color} h-4 rounded-sm`}></div>
      <div className={`w-2 ${color} h-5 rounded-sm`}></div>
      <div className={`w-2 ${color} h-6 rounded-sm`}></div>
      <div className={`w-2 ${color} h-7 rounded-sm`}></div>
      <div className={`w-2 ${color} h-8 rounded-sm`}></div>
    </div>
    <div className="flex justify-between text-xs text-gray-400 mt-2">
      <span>Mới: {newCount}</span>
      <span>Cũ: {oldCount}</span>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-4 bg-gray-600 rounded w-24"></div>
      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
    </div>
    <div className="flex items-baseline space-x-2 mb-2">
      <div className="h-8 bg-gray-600 rounded w-16"></div>
      <div className="h-4 bg-gray-600 rounded w-8"></div>
    </div>
    <div className="flex items-center space-x-2 mb-4">
      <div className="h-3 bg-gray-600 rounded w-12"></div>
      <div className="h-3 bg-gray-600 rounded w-16"></div>
    </div>
    <div className="h-8 flex items-end space-x-1">
      <div className="w-2 bg-gray-600 h-4 rounded-sm"></div>
      <div className="w-2 bg-gray-600 h-5 rounded-sm"></div>
      <div className="w-2 bg-gray-600 h-6 rounded-sm"></div>
      <div className="w-2 bg-gray-600 h-7 rounded-sm"></div>
      <div className="w-2 bg-gray-600 h-8 rounded-sm"></div>
    </div>
    <div className="flex justify-between text-xs mt-2">
      <div className="h-3 bg-gray-600 rounded w-12"></div>
      <div className="h-3 bg-gray-600 rounded w-12"></div>
    </div>
  </div>
);

export const DashboardStatsCards: React.FC<DashboardStatsCardsProps> = ({
  stats,
  title,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold text-white mb-6">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'KTS CÁ NHÂN',
      newCount: stats.ktsNew,
      oldCount: stats.ktsOld,
      total: stats.ktsNew + stats.ktsOld,
      color: 'bg-blue-400',
      icon: '🎯',
    },
    {
      title: 'ĐỐI TÁC CÁ NHÂN',
      newCount: stats.partnerNew,
      oldCount: stats.partnerOld,
      total: stats.partnerNew + stats.partnerOld,
      color: 'bg-green-400',
      icon: '🤝',
    },
    {
      title: 'KHÁCH HÀNG CÁ NHÂN',
      newCount: stats.customerNew,
      oldCount: stats.customerOld,
      total: stats.customerNew + stats.customerOld,
      color: 'bg-orange-400',
      icon: '👥',
    },
    {
      title: 'SBG CÁ NHÂN',
      newCount: stats.sbgNew,
      oldCount: stats.sbgOld,
      total: stats.sbgNew + stats.sbgOld,
      color: 'bg-purple-400',
      icon: '🏢',
    },
    {
      title: 'CÔNG VIỆC KHÁC',
      newCount: Math.floor(stats.other * 0.3), // Giả định 30% là mới
      oldCount: Math.ceil(stats.other * 0.7), // 70% là cũ
      total: stats.other,
      color: 'bg-gray-400',
      icon: '📋',
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold text-white mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default DashboardStatsCards;
