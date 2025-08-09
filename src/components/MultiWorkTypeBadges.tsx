import { Plus, X } from 'lucide-react';
import React from 'react';
import WorkTypeBadge, { WorkType } from './WorkTypeBadge';

interface MultiWorkTypeBadgesProps {
  workTypes: WorkType[] | string[] | string | undefined;
  onChange?: (workTypes: WorkType[]) => void;
  maxDisplay?: number;
  className?: string;
}

const allWorkTypes: WorkType[] = [
  'sbg-new',
  'sbg-old',
  'partner-new',
  'partner-old',
  'kts-new',
  'kts-old',
  'customer-new',
  'customer-old',
  'other',
];

const MultiWorkTypeBadges: React.FC<MultiWorkTypeBadgesProps> = ({
  workTypes,
  onChange,
  maxDisplay = 3,
  className = '',
}) => {
  // Normalize workTypes to array
  const normalizedWorkTypes: WorkType[] = (() => {
    console.log('🏷️ MultiWorkTypeBadges received workTypes:', workTypes, 'Type:', typeof workTypes);

    if (!workTypes) return ['other'];
    if (Array.isArray(workTypes)) return workTypes as WorkType[];
    if (typeof workTypes === 'string') {
      // Handle array string format like "[\"sbg-new\"]"
      if (workTypes.startsWith('[') && workTypes.endsWith(']')) {
        try {
          const parsed = JSON.parse(workTypes);
          return Array.isArray(parsed) ? parsed : [workTypes as WorkType];
        } catch {
          return [workTypes as WorkType];
        }
      }
      return [workTypes as WorkType];
    }
    return ['other'];
  })();

  console.log('🏷️ Normalized workTypes:', normalizedWorkTypes);

  const displayedTypes = normalizedWorkTypes.slice(0, maxDisplay);
  const remainingCount = normalizedWorkTypes.length - maxDisplay;

  const availableTypes = allWorkTypes.filter(type => !normalizedWorkTypes.includes(type));

  const handleRemoveType = (typeToRemove: WorkType) => {
    if (onChange) {
      const newTypes = normalizedWorkTypes.filter(type => type !== typeToRemove);
      onChange(newTypes);
    }
  };

  const handleAddType = (typeToAdd: WorkType) => {
    if (onChange && !normalizedWorkTypes.includes(typeToAdd)) {
      onChange([...normalizedWorkTypes, typeToAdd]);
    }
  };

  const handleChangeType = (oldType: WorkType, newType: WorkType) => {
    if (onChange) {
      const newTypes = normalizedWorkTypes.map(type => (type === oldType ? newType : type));
      onChange(newTypes);
    }
  };

  return (
    <div className={`flex items-center gap-1 flex-wrap ${className}`}>
      {/* Display current badges */}
      {displayedTypes.map((workType, index) => (
        <div key={`${workType}-${index}`} className="relative group">
          <WorkTypeBadge
            value={workType}
            onChange={onChange ? newType => handleChangeType(workType, newType) : undefined}
          />
          {onChange && normalizedWorkTypes.length > 1 && (
            <button
              onClick={e => {
                e.stopPropagation();
                handleRemoveType(workType);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Xóa danh mục"
            >
              <X className="w-2 h-2 text-white" />
            </button>
          )}
        </div>
      ))}

      {/* Show remaining count */}
      {remainingCount > 0 && (
        <div
          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white bg-gray-600 border border-gray-500/30"
          title={`+${remainingCount} danh mục khác`}
        >
          +{remainingCount}
        </div>
      )}

      {/* Add button - Simple select like StatusBadge */}
      {onChange && availableTypes.length > 0 && (
        <div className="relative inline-flex items-center">
          <div
            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 transition-colors cursor-pointer"
            title="Thêm danh mục"
          >
            <Plus className="w-3 h-3" />
          </div>
          <select
            value=""
            onChange={e => {
              if (e.target.value) {
                handleAddType(e.target.value as WorkType);
                e.target.value = ''; // Reset select
              }
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          >
            <option value="">Thêm danh mục</option>
            {availableTypes.map(type => (
              <option key={type} value={type}>
                {type === 'sbg-new' && 'SBG mới'}
                {type === 'sbg-old' && 'SBG cũ'}
                {type === 'partner-new' && 'Đối tác mới'}
                {type === 'partner-old' && 'Đối tác cũ'}
                {type === 'kts-new' && 'KTS mới'}
                {type === 'kts-old' && 'KTS cũ'}
                {type === 'customer-new' && 'Khách hàng mới'}
                {type === 'customer-old' && 'Khách hàng cũ'}
                {type === 'other' && 'Công việc khác'}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default MultiWorkTypeBadges;
