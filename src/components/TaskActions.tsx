import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  onEdit?: (e?: React.MouseEvent) => void;
  onDelete?: (e?: React.MouseEvent) => void;
  compact?: boolean; // Compact single-line layout
}

const TaskActions: React.FC<TaskActionsProps> = ({ onEdit, onDelete, compact = false }) => {
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
        {/* Edit Icon Only - Nổi bật hơn, touch-friendly trên mobile */}
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

        {/* Delete Icon Only - Nổi bật hơn, touch-friendly trên mobile */}
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
      </div>
    );
  }

  // Default vertical layout
  return (
    <div className="flex flex-col gap-2">
      {/* Edit Button */}
      <button
        onClick={handleEdit}
        className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 group"
        title="Chỉnh sửa công việc"
      >
        <Edit3 className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 group"
        title="Xóa công việc"
      >
        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default TaskActions;
