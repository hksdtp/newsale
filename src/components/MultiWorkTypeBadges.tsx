import React from 'react';
import WorkTypeBadge, { WorkType } from './WorkTypeBadge';

interface MultiWorkTypeBadgesProps {
  workTypes: WorkType[];
  onChange?: (workTypes: WorkType[]) => void;
  className?: string;
  maxDisplay?: number;
}

const MultiWorkTypeBadges: React.FC<MultiWorkTypeBadgesProps> = ({
  workTypes = [],
  onChange,
  className = '',
  maxDisplay = 3,
}) => {
  // Ensure we have at least one work type
  const displayWorkTypes = workTypes.length > 0 ? workTypes : ['other' as WorkType];

  // Limit the number of displayed badges
  const visibleWorkTypes = displayWorkTypes.slice(0, maxDisplay);
  const remainingCount = displayWorkTypes.length - maxDisplay;

  const handleWorkTypeChange = (index: number, newWorkType: WorkType) => {
    if (!onChange) return;

    const updatedWorkTypes = [...displayWorkTypes];
    updatedWorkTypes[index] = newWorkType;
    onChange(updatedWorkTypes);
  };

  const handleAddWorkType = () => {
    if (!onChange) return;

    const newWorkTypes = [...displayWorkTypes, 'other' as WorkType];
    onChange(newWorkTypes);
  };

  const handleRemoveWorkType = (index: number) => {
    if (!onChange || displayWorkTypes.length <= 1) return;

    const newWorkTypes = displayWorkTypes.filter((_, i) => i !== index);
    onChange(newWorkTypes);
  };

  return (
    <div className={`flex flex-wrap items-center gap-1 ${className}`}>
      {visibleWorkTypes.map((workType, index) => (
        <div key={index} className="relative group">
          <WorkTypeBadge
            value={workType}
            onChange={
              onChange ? newWorkType => handleWorkTypeChange(index, newWorkType) : undefined
            }
          />
          {onChange && displayWorkTypes.length > 1 && (
            <button
              onClick={() => handleRemoveWorkType(index)}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              title="Xóa danh mục"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400 border border-gray-600/30">
          +{remainingCount}
        </div>
      )}

      {onChange && displayWorkTypes.length < 5 && (
        <button
          onClick={handleAddWorkType}
          className="px-2 py-1 rounded-full text-xs font-medium bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:bg-gray-600/30 transition-colors"
          title="Thêm danh mục"
        >
          +
        </button>
      )}
    </div>
  );
};

export default MultiWorkTypeBadges;
