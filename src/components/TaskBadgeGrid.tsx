import React from 'react';
import MultiWorkTypeBadges from './MultiWorkTypeBadges';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import ShareScopeBadge from './ShareScopeBadge';
import { TaskWithUsers } from '../services/taskService';

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
  maxWorkTypes = 2
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

  // Layout desktop - hiển thị theo grid
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2 w-full">
      {/* Cột 1: Work Types */}
      <div className="flex items-center justify-start">
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

      {/* Cột 2: Status */}
      <div className="flex items-center justify-start">
        <StatusBadge
          value={task.status}
          onChange={(newStatus: 'new-requests' | 'approved' | 'live') =>
            onUpdateTask({ id: task.id, status: newStatus })
          }
        />
      </div>

      {/* Cột 3: Priority */}
      <div className="flex items-center justify-start">
        <PriorityBadge
          value={task.priority}
          onChange={(newPriority: 'low' | 'normal' | 'high') =>
            onUpdateTask({ id: task.id, priority: newPriority })
          }
        />
      </div>

      {/* Cột 4: Share Scope */}
      <div className="flex items-center justify-start">
        <ShareScopeBadge
          value={task.shareScope || 'team'}
          onChange={(newScope: 'private' | 'team' | 'public') =>
            onUpdateTask({ id: task.id, shareScope: newScope })
          }
        />
      </div>
    </div>
  );
};

export default TaskBadgeGrid;
