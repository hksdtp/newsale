import React from 'react';

export type WorkType =
  | 'other'
  | 'sbg-new'
  | 'sbg-old'
  | 'partner-new'
  | 'partner-old'
  | 'kts-new'
  | 'kts-old'
  | 'customer-new'
  | 'customer-old';

interface WorkTypeBadgeProps {
  value: WorkType;
  onChange?: (value: WorkType) => void;
  className?: string;
}

const workTypeMap: Record<WorkType, { label: string; color: string }> = {
  'sbg-new': {
    label: 'SBG mới',
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  'sbg-old': {
    label: 'SBG cũ',
    color: 'bg-blue-600/20 text-blue-400 border-blue-600/30',
  },
  'partner-new': {
    label: 'Đối tác mới',
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
  'partner-old': {
    label: 'Đối tác cũ',
    color: 'bg-green-600/20 text-green-400 border-green-600/30',
  },
  'kts-new': {
    label: 'KTS mới',
    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  'kts-old': {
    label: 'KTS cũ',
    color: 'bg-purple-600/20 text-purple-400 border-purple-600/30',
  },
  'customer-new': {
    label: 'Khách hàng mới',
    color: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  },
  'customer-old': {
    label: 'Khách hàng cũ',
    color: 'bg-orange-600/20 text-orange-400 border-orange-600/30',
  },
  other: {
    label: 'Công việc khác',
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  },
};

const WorkTypeBadge: React.FC<WorkTypeBadgeProps> = ({ value, onChange, className = '' }) => {
  const info = workTypeMap[value] || workTypeMap['other'];

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        data-testid="work-type-badge"
        className={`px-2 py-1 rounded-full text-xs font-medium border ${info.color} bg-gray-800/50`}
        title={info.label}
      >
        {info.label}
      </div>
      {onChange && (
        <select
          aria-label="Đổi danh mục công việc"
          value={value}
          onChange={e => onChange(e.target.value as WorkType)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          <option value="sbg-new">SBG mới</option>
          <option value="sbg-old">SBG cũ</option>
          <option value="partner-new">Đối tác mới</option>
          <option value="partner-old">Đối tác cũ</option>
          <option value="kts-new">KTS mới</option>
          <option value="kts-old">KTS cũ</option>
          <option value="customer-new">Khách hàng mới</option>
          <option value="customer-old">Khách hàng cũ</option>
          <option value="other">Công việc khác</option>
        </select>
      )}
    </div>
  );
};

export default WorkTypeBadge;
