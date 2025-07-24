import React from 'react';
import { Clock, CheckCircle, XCircle, AlertTriangle, Pause, Flag, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TaskStatusPriorityProps {
  status: 'new-requests' | 'approved' | 'live';
  priority: 'low' | 'normal' | 'high';
}

const TaskStatusPriority: React.FC<TaskStatusPriorityProps> = ({ status, priority }) => {
  // Status icons và colors
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new-requests':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          label: 'Chưa tiến hành'
        };
      case 'approved':
        return {
          icon: AlertTriangle,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Đang tiến hành'
        };
      case 'live':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          label: 'Đã hoàn thành'
        };
      default:
        return {
          icon: Pause,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          label: 'Tồn đọng'
        };
    }
  };

  // Priority icons và colors
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: ArrowUp,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          label: 'Cao'
        };
      case 'normal':
        return {
          icon: Minus,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          label: 'Bình thường'
        };
      case 'low':
        return {
          icon: ArrowDown,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          label: 'Thấp'
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          label: 'Bình thường'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const priorityConfig = getPriorityConfig(priority);
  
  const StatusIcon = statusConfig.icon;
  const PriorityIcon = priorityConfig.icon;

  return (
    <div className="flex flex-col gap-2">
      {/* Status */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${statusConfig.bgColor} ${statusConfig.borderColor}`}
        title={statusConfig.label}
      >
        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
        <span className={`text-xs font-medium ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      {/* Priority */}
      <div
        className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${priorityConfig.bgColor} ${priorityConfig.borderColor}`}
        title={`Ưu tiên ${priorityConfig.label}`}
      >
        <PriorityIcon className={`w-3 h-3 ${priorityConfig.color}`} />
        <span className={`text-xs font-medium ${priorityConfig.color}`}>
          {priorityConfig.label}
        </span>
      </div>
    </div>
  );
};

export default TaskStatusPriority;
