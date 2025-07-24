import React from 'react';
import { Building, Users, Target, User, Briefcase, TrendingUp, BarChart3 } from 'lucide-react';
import { Task, WORK_TYPES, WorkType } from '../data/dashboardMockData';

interface WorkTypeStatsProps {
  tasks: Task[];
}

const WorkTypeStats: React.FC<WorkTypeStatsProps> = ({ tasks }) => {
  // Tính toán thống kê theo loại công việc
  const getWorkTypeStats = () => {
    const stats: Record<WorkType, number> = {
      'other': 0,
      'sbg-new': 0,
      'sbg-old': 0,
      'partner-new': 0,
      'partner-old': 0,
      'kts-new': 0,
      'kts-old': 0,
      'customer-new': 0,
      'customer-old': 0
    };

    tasks.forEach(task => {
      if (task.workType && stats.hasOwnProperty(task.workType)) {
        stats[task.workType]++;
      }
    });

    return stats;
  };

  const stats = getWorkTypeStats();
  const totalTasks = tasks.length;

  // Cấu hình icon và màu sắc cho từng loại
  const workTypeConfig = {
    'other': { icon: Briefcase, color: 'text-gray-400', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' },
    'sbg-new': { icon: Building, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
    'sbg-old': { icon: Building, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
    'partner-new': { icon: Users, color: 'text-purple-400', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/20' },
    'partner-old': { icon: Users, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', borderColor: 'border-indigo-500/20' },
    'kts-new': { icon: Target, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
    'kts-old': { icon: Target, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
    'customer-new': { icon: User, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
    'customer-old': { icon: User, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' }
  };

  // Tính toán thống kê tổng hợp
  const categoryStats = {
    sbg: stats['sbg-new'] + stats['sbg-old'],
    partner: stats['partner-new'] + stats['partner-old'],
    kts: stats['kts-new'] + stats['kts-old'],
    customer: stats['customer-new'] + stats['customer-old'],
    other: stats['other']
  };

  const newVsOld = {
    new: stats['sbg-new'] + stats['partner-new'] + stats['kts-new'] + stats['customer-new'],
    old: stats['sbg-old'] + stats['partner-old'] + stats['kts-old'] + stats['customer-old']
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Thống kê theo loại công việc</h3>
      </div>

      {/* Thống kê chi tiết theo từng loại */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(WORK_TYPES).map(([key, label]) => {
          const workType = key as WorkType;
          const config = workTypeConfig[workType];
          const Icon = config.icon;
          const count = stats[workType];
          const percentage = totalTasks > 0 ? ((count / totalTasks) * 100).toFixed(1) : '0';

          return (
            <div
              key={workType}
              className={`p-4 rounded-xl border ${config.bgColor} ${config.borderColor} hover:scale-105 transition-transform`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium text-sm">{label}</h4>
                  <p className="text-gray-400 text-xs">{percentage}% tổng số</p>
                </div>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${config.color}`}>{count}</span>
                <span className="text-gray-400 text-sm">công việc</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thống kê tổng hợp theo danh mục */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          Thống kê theo danh mục
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">SBG (Sàn BĐS)</span>
              <span className="text-white font-semibold">{categoryStats.sbg}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Đối tác</span>
              <span className="text-white font-semibold">{categoryStats.partner}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">KTS (Kiến trúc sư)</span>
              <span className="text-white font-semibold">{categoryStats.kts}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Khách hàng</span>
              <span className="text-white font-semibold">{categoryStats.customer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Công việc khác</span>
              <span className="text-white font-semibold">{categoryStats.other}</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-600 pt-3">
              <span className="text-blue-400 font-medium">Tổng cộng</span>
              <span className="text-blue-400 font-bold">{totalTasks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thống kê Mới vs Cũ */}
      <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700">
        <h4 className="text-white font-semibold mb-4">Phân tích Phát triển vs Duy trì</h4>
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
            <h5 className="text-green-400 font-semibold text-lg">Phát triển mới</h5>
            <p className="text-2xl font-bold text-white mt-1">{newVsOld.new}</p>
            <p className="text-gray-400 text-sm">
              {totalTasks > 0 ? ((newVsOld.new / totalTasks) * 100).toFixed(1) : '0'}% tổng số
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h5 className="text-blue-400 font-semibold text-lg">Duy trì hiện tại</h5>
            <p className="text-2xl font-bold text-white mt-1">{newVsOld.old}</p>
            <p className="text-gray-400 text-sm">
              {totalTasks > 0 ? ((newVsOld.old / totalTasks) * 100).toFixed(1) : '0'}% tổng số
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkTypeStats;
