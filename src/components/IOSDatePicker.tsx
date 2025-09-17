import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createLocalDate, formatLocalDateString } from '../utils/dateUtils';

interface IOSDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  buttonClassName?: string;
  color?: 'green' | 'red' | 'blue' | 'purple';
}

const IOSDatePicker: React.FC<IOSDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  label,
  required = false,
  minDate,
  maxDate,
  isOpen,
  onToggle,
  onClose,
  buttonClassName = '',
  color = 'blue',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? createLocalDate(value) : null
  );
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Color variants
  const colorVariants = {
    green: {
      button: 'hover:border-green-500 focus:border-green-500',
      accent: 'bg-green-500 text-white',
      hover: 'hover:bg-green-500/10',
    },
    red: {
      button: 'hover:border-red-500 focus:border-red-500',
      accent: 'bg-red-500 text-white',
      hover: 'hover:bg-red-500/10',
    },
    blue: {
      button: 'hover:border-blue-500 focus:border-blue-500',
      accent: 'bg-blue-500 text-white',
      hover: 'hover:bg-blue-500/10',
    },
    purple: {
      button: 'hover:border-purple-500 focus:border-purple-500',
      accent: 'bg-purple-500 text-white',
      hover: 'hover:bg-purple-500/10',
    },
  };

  const colors = colorVariants[color];

  // Helper functions for dynamic class names to avoid Tailwind purging issues
  const getTodayTextColor = (colorName: string) => {
    switch (colorName) {
      case 'green':
        return 'text-green-400';
      case 'red':
        return 'text-red-400';
      case 'blue':
        return 'text-blue-400';
      case 'purple':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };

  const getTodayBorderColor = (colorName: string) => {
    switch (colorName) {
      case 'green':
        return 'border border-green-500/30';
      case 'red':
        return 'border border-red-500/30';
      case 'blue':
        return 'border border-blue-500/30';
      case 'purple':
        return 'border border-purple-500/30';
      default:
        return 'border border-blue-500/30';
    }
  };

  useEffect(() => {
    if (value) {
      const date = createLocalDate(value);
      if (date) {
        setSelectedDate(date);
        setCurrentMonth(date);
      }
    }
  }, [value]);

  // Auto-adjust dropdown position to prevent clipping
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 500; // Estimated dropdown height

      // Check if dropdown would be clipped at bottom
      if (rect.bottom + dropdownHeight > viewportHeight) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return placeholder;
    return date.toLocaleDateString('vi-VN', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatInputDate = (date: Date) => {
    return formatLocalDateString(date);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatInputDate(date));
    onClose();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const isDateDisabled = (date: Date) => {
    const dateTime = date.getTime();

    if (minDate) {
      const minDateObj = createLocalDate(minDate);
      if (minDateObj && dateTime < minDateObj.getTime()) return true;
    }

    if (maxDate) {
      const maxDateObj = createLocalDate(maxDate);
      if (maxDateObj && dateTime > maxDateObj.getTime()) return true;
    }

    return false;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-white font-medium mb-2 text-sm">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input Button */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-left transition-all duration-200 ${colors.button} ${buttonClassName}`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
            {formatDisplayDate(selectedDate)}
          </span>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {/* iOS-style Calendar Dropdown - Smart positioning */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-[9999] overflow-hidden animate-in duration-300 min-w-[320px] md:min-w-[380px] ${
            dropdownPosition === 'bottom'
              ? 'top-full mt-2 slide-in-from-top-2'
              : 'bottom-full mb-2 slide-in-from-bottom-2'
          }`}
        >
          {/* Header - Cải thiện spacing và typography */}
          <div className="flex items-center justify-between p-5 border-b border-gray-700/50 bg-gray-800/80">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>

            <h3 className="text-white font-semibold text-xl tracking-wide">
              {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h3>

            <button
              onClick={() => navigateMonth('next')}
              className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Week Days - Cải thiện spacing */}
          <div className="grid grid-cols-7 border-b border-gray-700/30 bg-gray-800/60">
            {weekDays.map(day => (
              <div key={day} className="p-4 text-center text-gray-400 text-sm font-semibold">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Tăng kích thước và spacing */}
          <div className="grid grid-cols-7 p-4 gap-2">
            {days.map((date, index) => (
              <div key={index} className="aspect-square">
                {date && (
                  <button
                    onClick={() => handleDateSelect(date)}
                    disabled={isDateDisabled(date)}
                    className={`
                      w-full h-full rounded-xl text-base font-semibold transition-all duration-200 transform min-h-[44px]
                      ${
                        isSelected(date)
                          ? `${colors.accent} shadow-lg scale-105 ring-2 ring-white/20`
                          : isToday(date)
                            ? `${colors.hover} ${getTodayTextColor(color)} ${getTodayBorderColor(color)} scale-105`
                            : isDateDisabled(date)
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-300 hover:bg-gray-700/50 hover:text-white hover:scale-105'
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions - Cải thiện spacing và style */}
          <div className="p-4 border-t border-gray-700/30 flex gap-3 bg-gray-800/60">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="px-5 py-3 text-sm font-medium bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:scale-105"
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              className="px-5 py-3 text-sm font-medium bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white rounded-xl transition-all duration-200 hover:scale-105"
            >
              Ngày mai
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-gray-700/50 rounded-xl transition-all duration-200 hover:scale-105"
              title="Đóng"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSDatePicker;
