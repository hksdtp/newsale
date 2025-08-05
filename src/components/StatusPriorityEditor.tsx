import React from 'react';
import { ChevronDown } from 'lucide-react';

interface StatusPriorityEditorProps {
  status: 'new-requests' | 'approved' | 'live';
  priority: 'low' | 'normal' | 'high';
  onStatusChange: (status: 'new-requests' | 'approved' | 'live') => void;
  onPriorityChange: (priority: 'low' | 'normal' | 'high') => void;
  isEditMode: boolean;
}

const StatusPriorityEditor: React.FC<StatusPriorityEditorProps> = ({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  isEditMode
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'new-requests':
        return { label: 'Yêu cầu mới', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' };
      case 'approved':
        return { label: 'Đã duyệt', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'live':
        return { label: 'Đang thực hiện', color: 'bg-green-500/20 text-green-300 border-green-500/30' };
      default:
        return { label: 'Không xác định', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
    }
  };

  const getPriorityInfo = (priority: string) => {
    switch (priority) {
      case 'low':
        return { label: 'Thấp', color: 'bg-gray-500/20 text-gray-300 border-gray-500/30' };
      case 'normal':
        return { label: 'Bình thường', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'high':
        return { label: 'Cao', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
      default:
        return { label: 'Bình thường', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    }
  };

  const statusInfo = getStatusInfo(status);
  const priorityInfo = getPriorityInfo(priority);

  if (!isEditMode) {
    return (
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityInfo.color}`}>
          {priorityInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Status Dropdown */}
      <div className="relative">
        <div className={`relative px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${statusInfo.color} bg-gray-800/50`}>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as 'new-requests' | 'approved' | 'live')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="new-requests">Yêu cầu mới</option>
            <option value="approved">Đã duyệt</option>
            <option value="live">Đang thực hiện</option>
          </select>
          <div className="flex items-center justify-between">
            <span>{statusInfo.label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>

      {/* Priority Dropdown */}
      <div className="relative">
        <div className={`relative px-3 py-1 rounded-full text-xs font-medium border cursor-pointer ${priorityInfo.color} bg-gray-800/50`}>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as 'low' | 'normal' | 'high')}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          >
            <option value="low">Thấp</option>
            <option value="normal">Bình thường</option>
            <option value="high">Cao</option>
          </select>
          <div className="flex items-center justify-between">
            <span>{priorityInfo.label}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusPriorityEditor;
