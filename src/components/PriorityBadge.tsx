import React from 'react';

export type TaskPriority = 'low' | 'normal' | 'high';

interface PriorityBadgeProps {
  value: TaskPriority;
  onChange?: (value: TaskPriority) => void;
  className?: string;
}

const priorityMap: Record<TaskPriority, { label: string; color: string }> = {
  high: {
    label: 'Cao',
    color: 'bg-red-500/20 text-red-300 border-red-500/30',
  },
  normal: {
    label: 'Bình thường',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  low: {
    label: 'Thấp',
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  },
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ value, onChange, className = '' }) => {
  const info = priorityMap[value] || priorityMap['normal'];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`px-2 py-1 rounded-full text-xs font-medium border ${info.color} bg-gray-800/50`}
        title={`Ưu tiên ${info.label}`}
      >
        {info.label}
      </div>
      {onChange && (
        <select
          aria-label="Đổi ưu tiên"
          value={value}
          onChange={(e) => onChange(e.target.value as TaskPriority)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          <option value="low">Thấp</option>
          <option value="normal">Bình thường</option>
          <option value="high">Cao</option>
        </select>
      )}
    </div>
  );
};

export default PriorityBadge;

