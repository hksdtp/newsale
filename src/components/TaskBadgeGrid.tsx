import React from 'react';
import { TaskWithUsers } from '../services/taskService';
import MultiWorkTypeBadges from './MultiWorkTypeBadges';
import PriorityBadge from './PriorityBadge';
import ShareScopeBadge from './ShareScopeBadge';
import StatusBadge from './StatusBadge';

interface TaskBadgeGridProps {
  /** Task data */
  task: TaskWithUsers;
  /** Callback khi cập nhật task */
  onUpdateTask: (updates: any) => void;
  /** Hiển thị compact cho mobile */
  compact?: boolean;
  /** Số lượng work types tối đa hiển thị */
  maxWorkTypes?: number;
}

const TaskBadgeGrid: React.FC<TaskBadgeGridProps> = ({
  task,
  onUpdateTask,
  compact = false,
  maxWorkTypes = 2,
}) => {
  if (compact) {
    // Layout compact cho mobile - hiển thị theo hàng dọc
    return (
      <div className="flex flex-col gap-1 w-full">
        {/* Hàng 1: Work Types */}
        <div className="flex items-center gap-1 flex-wrap">
          <MultiWorkTypeBadges
            workTypes={task.workTypes || [task.workType]}
            onChange={newWorkTypes => {
              onUpdateTask({
                id: task.id,
                workTypes: newWorkTypes as any,
              });
            }}
            maxDisplay={maxWorkTypes}
          />
        </div>

        {/* Hàng 2: Status và Priority */}
        <div className="flex items-center gap-1 flex-wrap">
          <StatusBadge
            value={task.status}
            onChange={(newStatus: 'new-requests' | 'approved' | 'live') =>
              onUpdateTask({ id: task.id, status: newStatus })
            }
          />
          <PriorityBadge
            value={task.priority}
            onChange={(newPriority: 'low' | 'normal' | 'high') =>
              onUpdateTask({ id: task.id, priority: newPriority })
            }
          />
        </div>

        {/* Hàng 3: Share Scope */}
        <div className="flex items-center gap-1">
          <ShareScopeBadge
            value={task.shareScope || 'team'}
            onChange={(newScope: 'private' | 'team' | 'public') =>
              onUpdateTask({ id: task.id, shareScope: newScope })
            }
          />
        </div>
      </div>
    );
  }

  // Layout desktop - hiển thị theo flex để badges căn sát nhau
  return (
    <div className="flex items-center gap-2 flex-wrap w-full">
      {/* Work Types */}
      <MultiWorkTypeBadges
        workTypes={task.workTypes || [task.workType]}
        onChange={newWorkTypes => {
          onUpdateTask({
            id: task.id,
            workTypes: newWorkTypes as any,
          });
        }}
        maxDisplay={maxWorkTypes}
      />

      {/* Status */}
      <StatusBadge
        value={task.status}
        onChange={(newStatus: 'new-requests' | 'approved' | 'live') =>
          onUpdateTask({ id: task.id, status: newStatus })
        }
      />

      {/* Priority */}
      <PriorityBadge
        value={task.priority}
        onChange={(newPriority: 'low' | 'normal' | 'high') =>
          onUpdateTask({ id: task.id, priority: newPriority })
        }
      />

      {/* Share Scope */}
      <ShareScopeBadge
        value={task.shareScope || 'team'}
        onChange={(newScope: 'private' | 'team' | 'public') =>
          onUpdateTask({ id: task.id, shareScope: newScope })
        }
      />
    </div>
  );
};

export default TaskBadgeGrid;
