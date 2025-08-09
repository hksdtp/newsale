import { Calendar, ChevronDown } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { TimeFilter } from '../services/dashboardStatsService';

interface TimeFilterDropdownProps {
  value: TimeFilter;
  onChange: (filter: TimeFilter) => void;
  className?: string;
}

const TIME_FILTER_OPTIONS = [
  { value: 'today', label: 'Hôm nay', icon: '📅' },
  { value: 'week', label: 'Tuần này', icon: '📊' },
  { value: 'month', label: 'Tháng này', icon: '📈' },
  { value: 'all', label: 'Tất cả', icon: '🗂️' },
] as const;

export const TimeFilterDropdown: React.FC<TimeFilterDropdownProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const currentOption = TIME_FILTER_OPTIONS.find(option => option.value === value.period);

  const handleOptionSelect = (period: TimeFilter['period']) => {
    onChange({ period });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <Calendar className="w-4 h-4" />
        <span>{currentOption?.label || 'Chọn thời gian'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-50">
          <div className="py-2">
            {TIME_FILTER_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionSelect(option.value)}
                className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-3 ${
                  value.period === option.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-base">{option.icon}</span>
                <span>{option.label}</span>
                {value.period === option.value && <span className="ml-auto text-blue-300">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeFilterDropdown;
