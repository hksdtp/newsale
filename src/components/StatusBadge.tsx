import React from 'react';

export type TaskStatus = 'new-requests' | 'approved' | 'live';

interface StatusBadgeProps {
  value: TaskStatus;
  onChange?: (value: TaskStatus) => void;
  className?: string;
}

const statusMap: Record<TaskStatus, { label: string; color: string }> = {
  'new-requests': {
    label: 'Chưa tiến hành',
    color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  },
  approved: {
    label: 'Đang tiến hành',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  live: {
    label: 'Đã hoàn thành',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ value, onChange, className = '' }) => {
  const info = statusMap[value] || statusMap['new-requests'];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium border ${info.color} bg-gray-800/50`}
        title={info.label}
      >
        {info.label}
      </div>
      {onChange && (
        <select
          aria-label="Đổi trạng thái"
          value={value}
          onChange={(e) => onChange(e.target.value as TaskStatus)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          <option value="new-requests">Chưa tiến hành</option>
          <option value="approved">Đang tiến hành</option>
          <option value="live">Đã hoàn thành</option>
        </select>
      )}
    </div>
  );
};

export default StatusBadge;

