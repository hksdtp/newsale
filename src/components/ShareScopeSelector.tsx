import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users, Lock, Globe } from 'lucide-react';

interface ShareScopeOption {
  value: 'team' | 'private' | 'public';
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ShareScopeSelectorProps {
  value: 'team' | 'private' | 'public';
  onChange: (value: 'team' | 'private' | 'public') => void;
  label?: string;
  required?: boolean;
}

const ShareScopeSelector: React.FC<ShareScopeSelectorProps> = ({
  value,
  onChange,
  label = "Phạm vi chia sẻ",
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: ShareScopeOption[] = [
    {
      value: 'public',
      label: 'Chung',
      description: 'Mọi người trong công ty có thể xem',
      icon: Globe,
      color: 'text-green-400'
    },
    {
      value: 'team',
      label: 'Nhóm',
      description: 'Chỉ thành viên trong nhóm có thể xem',
      icon: Users,
      color: 'text-blue-400'
    },
    {
      value: 'private',
      label: 'Tôi',
      description: 'Chỉ mình tôi có thể xem',
      icon: Lock,
      color: 'text-gray-400'
    }
  ];

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  const handleSelect = (optionValue: 'team' | 'private' | 'public') => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </label>

      {/* Selector Container */}
      <div ref={containerRef} className="relative">
        {/* Trigger Button - Facebook style */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-gray-500 transition-colors focus:border-blue-500 focus:outline-none"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedOption && (
                <>
                  <div className={`w-5 h-5 ${selectedOption.color}`}>
                    <selectedOption.icon className="w-full h-full" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-medium text-sm">
                      {selectedOption.label}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {selectedOption.description}
                    </div>
                  </div>
                </>
              )}
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`} 
            />
          </div>
        </button>

        {/* Dropdown Menu - Facebook style */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl z-50 overflow-hidden">
            <div className="py-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3
                    ${value === option.value ? 'bg-gray-700/50' : ''}
                  `}
                >
                  {/* Icon */}
                  <div className={`w-5 h-5 ${option.color} flex-shrink-0`}>
                    <option.icon className="w-full h-full" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm">
                      {option.label}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {option.description}
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {value === option.value && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className="text-gray-400 text-sm">
        {selectedOption?.value === 'public' && 'Tất cả nhân viên trong công ty có thể xem công việc này'}
        {selectedOption?.value === 'team' && 'Chỉ thành viên trong nhóm của bạn có thể xem'}
        {selectedOption?.value === 'private' && 'Chỉ bạn có thể xem công việc này'}
      </div>
    </div>
  );
};

export default ShareScopeSelector;
