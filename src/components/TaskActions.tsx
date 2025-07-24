import React from 'react';
import { Edit3, Trash2 } from 'lucide-react';

interface TaskActionsProps {
  onEdit?: (e?: React.MouseEvent) => void;
  onDelete?: (e?: React.MouseEvent) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ onEdit, onDelete }) => {
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
