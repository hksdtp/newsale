import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check, Building, Users, Target, User } from 'lucide-react';

export interface WorkTypeOption {
  value: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  category?: string;
}

interface WorkTypeDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
}

const WorkTypeDropdown: React.FC<WorkTypeDropdownProps> = ({
  value = [],
  onChange,
  placeholder = 'Chọn danh mục công việc',
  label,
  required = false,
  disabled = false,
  helperText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Work type options with categories
  const workTypeOptions: WorkTypeOption[] = [
    { value: 'sbg_new', label: 'SBG mới', icon: Building, color: 'bg-blue-500', category: 'SBG' },
    { value: 'sbg_old', label: 'SBG cũ', icon: Building, color: 'bg-blue-600', category: 'SBG' },
    { value: 'partner_new', label: 'Đối tác mới', icon: Users, color: 'bg-green-500', category: 'ĐỐI TÁC' },
    { value: 'partner_old', label: 'Đối tác cũ', icon: Users, color: 'bg-green-600', category: 'ĐỐI TÁC' },
    { value: 'kts_new', label: 'KTS mới', icon: Target, color: 'bg-purple-500', category: 'KTS' },
    { value: 'kts_old', label: 'KTS cũ', icon: Target, color: 'bg-purple-600', category: 'KTS' },
    { value: 'customer_new', label: 'Khách hàng mới', icon: User, color: 'bg-orange-500', category: 'KHÁCH HÀNG' },
    { value: 'customer_old', label: 'Khách hàng cũ', icon: User, color: 'bg-orange-600', category: 'KHÁCH HÀNG' },
    { value: 'other', label: 'Công việc khác', icon: Building, color: 'bg-gray-500', category: 'KHÁC' },
  ];

  // Group options by category
  const groupedOptions = workTypeOptions.reduce((acc, option) => {
    const category = option.category || 'Khác';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  }, {} as Record<string, WorkTypeOption[]>);

  // Filter options based on search term
  const filteredOptions = Object.entries(groupedOptions).reduce((acc, [category, options]) => {
    const filtered = options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {} as Record<string, WorkTypeOption[]>);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const selectedOptions = workTypeOptions.filter(option => value.includes(option.value));
  const displayedBadges = selectedOptions.slice(0, 3);
  const remainingCount = selectedOptions.length - 3;

  return (
    <div className="relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setSearchTerm(''); // Reset search when opening
            }
          }
        }}
        disabled={disabled}
        className={`w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-left focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[44px] ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-400 text-sm">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {displayedBadges.map((option) => (
                  <span
                    key={option.value}
                    className={`dropdown-badge inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white ${option.color}`}
                  >
                    <span className="truncate max-w-[120px]">{option.label}</span>
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.value);
                      }}
                      className="ml-1.5 hover:bg-white/20 rounded-full p-0.5 transition-colors cursor-pointer inline-flex items-center justify-center"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveOption(option.value);
                        }
                      }}
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-600 text-gray-200">
                    +{remainingCount}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            {selectedOptions.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearAll();
                }}
                className="text-gray-400 hover:text-gray-200 transition-colors cursor-pointer inline-flex items-center justify-center"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleClearAll();
                  }
                }}
                title="Xóa tất cả"
              >
                <X className="w-4 h-4" />
              </span>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50 top-full mt-2 max-h-[70vh] md:max-h-[400px] flex flex-col">
          {/* Header with Done button - removed search */}
          <div className="p-3 border-b border-gray-600 bg-gray-700/30 flex-shrink-0">
            <div className="flex items-center justify-between">
              {selectedOptions.length > 0 && (
                <div className="text-xs text-gray-400">
                  Đã chọn: {selectedOptions.length} loại công việc
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Xong
              </button>
            </div>
          </div>
          <div className="dropdown-options-list overflow-y-auto flex-1 min-h-0">
            {Object.entries(filteredOptions).map(([category, options]) => {
              if (options.length === 0) return null;
              return (
                <div key={category}>
                  <div className="px-3 py-1.5 bg-gray-750/30">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {category}
                    </span>
                  </div>
                  <div className="dropdown-grid p-3">
                    {options.map((option) => {
                      const isSelected = value.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleToggleOption(option.value)}
                          className={`dropdown-badge btn-touch px-3 py-2.5 rounded-full text-center min-h-[44px] flex items-center justify-center text-sm font-medium ${
                            isSelected
                              ? `${option.color} text-white selected`
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{option.label}</span>
                          {isSelected && <Check className="w-3 h-3 ml-1 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {Object.values(filteredOptions).every(options => options.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                Không tìm thấy loại công việc phù hợp
              </div>
            )}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <div className="text-gray-400 text-sm mt-2">
          {helperText}
        </div>
      )}
    </div>
  );
};

export default WorkTypeDropdown;
