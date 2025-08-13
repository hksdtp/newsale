import React from 'react';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface QuickStatusFiltersProps {
  /** Danh sách công việc để tính số lượng */
  tasks: Array<{ status: 'new-requests' | 'approved' | 'live' }>;
  /** Trạng thái filter hiện tại */
  activeFilter: 'all' | 'new-requests' | 'approved' | 'live';
  /** Callback khi thay đổi filter */
  onFilterChange: (filter: 'all' | 'new-requests' | 'approved' | 'live') => void;
  /** Tùy chọn hiển thị compact cho mobile */
  compact?: boolean;
}

const QuickStatusFilters: React.FC<QuickStatusFiltersProps> = ({
  tasks,
  activeFilter,
  onFilterChange,
  compact = false
}) => {
  // Tính số lượng công việc cho mỗi trạng thái
  const statusCounts = {
    all: tasks.length,
    'new-requests': tasks.filter(task => task.status === 'new-requests').length,
    'approved': tasks.filter(task => task.status === 'approved').length,
    'live': tasks.filter(task => task.status === 'live').length,
  };

  // Cấu hình cho từng filter button
  const filterConfigs = [
    {
      key: 'all' as const,
      label: 'Tất cả',
      icon: null,
      count: statusCounts.all,
      color: 'text-gray-400',
      bgColor: 'bg-gray-700/50',
      activeColor: 'text-white',
      activeBgColor: 'bg-gray-600',
      borderColor: 'border-gray-600',
      activeBorderColor: 'border-gray-500'
    },
    {
      key: 'new-requests' as const,
      label: compact ? 'Chưa bắt đầu' : 'Chưa tiến hành',
      icon: Clock,
      count: statusCounts['new-requests'],
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      activeColor: 'text-yellow-300',
      activeBgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      activeBorderColor: 'border-yellow-400'
    },
    {
      key: 'approved' as const,
      label: compact ? 'Đang làm' : 'Đang tiến hành',
      icon: AlertTriangle,
      count: statusCounts.approved,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      activeColor: 'text-blue-300',
      activeBgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      activeBorderColor: 'border-blue-400'
    },
    {
      key: 'live' as const,
      label: compact ? 'Hoàn thành' : 'Đã hoàn thành',
      icon: CheckCircle,
      count: statusCounts.live,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      activeColor: 'text-green-300',
      activeBgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      activeBorderColor: 'border-green-400'
    }
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 p-3 mb-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
        <h3 className="text-sm font-medium text-gray-300">Lọc nhanh theo trạng thái</h3>
      </div>

      {/* Filter Buttons */}
      <div className={`grid gap-2 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {filterConfigs.map((config) => {
          const isActive = activeFilter === config.key;
          const Icon = config.icon;

          return (
            <button
              key={config.key}
              onClick={() => onFilterChange(config.key)}
              className={`
                relative flex items-center gap-2 p-3 rounded-lg border transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg
                ${isActive 
                  ? `${config.activeBgColor} ${config.activeBorderColor} ${config.activeColor}` 
                  : `${config.bgColor} ${config.borderColor} ${config.color} hover:${config.activeBgColor}`
                }
                ${compact ? 'text-xs' : 'text-sm'}
              `}
            >
              {/* Icon */}
              {Icon && (
                <Icon className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} flex-shrink-0`} />
              )}

              {/* Label và Count */}
              <div className="flex-1 text-left">
                <div className={`font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
                  {config.label}
                </div>
                <div className={`${compact ? 'text-xs' : 'text-xs'} opacity-75`}>
                  {config.count} công việc
                </div>
              </div>

              {/* Count Badge */}
              <div className={`
                px-2 py-1 rounded-full text-xs font-bold
                ${isActive 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-700/50 text-gray-300'
                }
              `}>
                {config.count}
              </div>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-75"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-3 pt-3 border-t border-gray-700/50">
        <div className="text-xs text-gray-400 text-center">
          Tổng cộng: <span className="font-medium text-gray-300">{statusCounts.all}</span> công việc
          {activeFilter !== 'all' && (
            <span className="ml-2">
              • Đang hiển thị: <span className="font-medium text-blue-300">{statusCounts[activeFilter]}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStatusFilters;
