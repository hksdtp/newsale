import { Edit3, Trash2 } from 'lucide-react';
import React from 'react';
import { TaskWithUsers } from '../services/taskService';
import { getTaskPermissions } from '../utils/taskPermissions';

interface TaskActionsProps {
  task?: TaskWithUsers; // Task object để kiểm tra quyền
  onEdit?: (e?: React.MouseEvent) => void;
  onDelete?: (e?: React.MouseEvent) => void;
  compact?: boolean; // Compact single-line layout
}

const TaskActions: React.FC<TaskActionsProps> = ({ task, onEdit, onDelete, compact = false }) => {
  // Kiểm tra quyền hạn của user hiện tại đối với task này
  const permissions = task ? getTaskPermissions(task) : { canEdit: true, canDelete: true };

  // Nếu không có quyền edit và delete thì không hiển thị gì
  if (!permissions.canEdit && !permissions.canDelete) {
    return null;
  }
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(e);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(e);
    }
  };

  // Compact single-line layout cho Gmail-style - Làm nổi bật hơn
  if (compact) {
    return (
      <div className="flex items-center gap-1 bg-gray-800/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border border-gray-600/50">
        {/* Edit Icon Only - Chỉ hiển thị nếu có quyền edit */}
        {permissions.canEdit && (
          <button
            onClick={handleEdit}
            className="
              p-2 rounded-md
              bg-blue-500/20 border border-blue-500/30
              text-blue-300 hover:text-blue-200
              hover:bg-blue-500/30 hover:border-blue-400/50
              hover:scale-105 hover:shadow-md
              transition-all duration-200
              backdrop-blur-sm
              min-h-[44px] min-w-[44px] md:min-h-[auto] md:min-w-[auto]
              active:scale-95 active:bg-blue-500/40
            "
            title="Chỉnh sửa công việc"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        )}

        {/* Delete Icon Only - Chỉ hiển thị nếu có quyền delete */}
        {permissions.canDelete && (
          <button
            onClick={handleDelete}
            className="
              p-2 rounded-md
              bg-red-500/20 border border-red-500/30
              text-red-300 hover:text-red-200
              hover:bg-red-500/30 hover:border-red-400/50
              hover:scale-105 hover:shadow-md
              transition-all duration-200
              backdrop-blur-sm
              min-h-[44px] min-w-[44px] md:min-h-[auto] md:min-w-[auto]
              active:scale-95 active:bg-red-500/40
            "
            title="Xóa công việc"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // Default vertical layout
  return (
    <div className="flex flex-col gap-2">
      {/* Edit Button - Chỉ hiển thị nếu có quyền edit */}
      {permissions.canEdit && (
        <button
          onClick={handleEdit}
          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 group"
          title="Chỉnh sửa công việc"
        >
          <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}

      {/* Delete Button - Chỉ hiển thị nếu có quyền delete */}
      {permissions.canDelete && (
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
          title="Xóa công việc"
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
};

export default TaskActions;
