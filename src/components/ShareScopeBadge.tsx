import React from 'react';
import { Lock, Users, Globe } from 'lucide-react';

export type ShareScope = 'private' | 'team' | 'public';

interface ShareScopeBadgeProps {
  value: ShareScope;
  onChange?: (value: ShareScope) => void;
  className?: string;
}

const scopeMap: Record<ShareScope, { label: string; icon: React.ComponentType<any>; color: string }> = {
  private: {
    label: 'Cá nhân',
    icon: Lock,
    color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  },
  team: {
    label: 'Nhóm',
    icon: Users,
    color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  public: {
    label: 'Công khai',
    icon: Globe,
    color: 'bg-green-500/20 text-green-300 border-green-500/30',
  },
};

const ShareScopeBadge: React.FC<ShareScopeBadgeProps> = ({ value, onChange, className = '' }) => {
  const info = scopeMap[value] || scopeMap['team'];
  const Icon = info.icon;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`w-6 h-6 rounded-full border flex items-center justify-center ${info.color} bg-gray-800/50`}
        title={info.label}
      >
        <Icon className="w-3 h-3" />
      </div>
      {onChange && (
        <select
          aria-label="Đổi phạm vi chia sẻ"
          value={value}
          onChange={(e) => onChange(e.target.value as ShareScope)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        >
          <option value="private">Cá nhân</option>
          <option value="team">Nhóm</option>
          <option value="public">Công khai</option>
        </select>
      )}
    </div>
  );
};

export default ShareScopeBadge;
