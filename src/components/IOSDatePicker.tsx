import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

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
  placeholder = "Chọn ngày",
  label,
  required = false,
  minDate,
  maxDate,
  isOpen,
  onToggle,
  onClose,
  buttonClassName = "",
  color = 'blue'
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? new Date(value) : null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Color variants
  const colorVariants = {
    green: {
      button: 'hover:border-green-500 focus:border-green-500',
      accent: 'bg-green-500 text-white',
      hover: 'hover:bg-green-500/10'
    },
    red: {
      button: 'hover:border-red-500 focus:border-red-500',
      accent: 'bg-red-500 text-white',
      hover: 'hover:bg-red-500/10'
    },
    blue: {
      button: 'hover:border-blue-500 focus:border-blue-500',
      accent: 'bg-blue-500 text-white',
      hover: 'hover:bg-blue-500/10'
    },
    purple: {
      button: 'hover:border-purple-500 focus:border-purple-500',
      accent: 'bg-purple-500 text-white',
      hover: 'hover:bg-purple-500/10'
    }
  };

  const colors = colorVariants[color];

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date);
    }
  }, [value]);

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
      year: 'numeric'
    });
  };

  const formatInputDate = (date: Date) => {
    return date.toISOString().split('T')[0];
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
    onChange(formatInputDate(date) + 'T00:00:00.000Z');
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
      const minDateTime = new Date(minDate).getTime();
      if (dateTime < minDateTime) return true;
    }
    
    if (maxDate) {
      const maxDateTime = new Date(maxDate).getTime();
      if (dateTime > maxDateTime) return true;
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
        className={`w-full p-2.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-left transition-all duration-200 ${colors.button} ${buttonClassName}`}
      >
        <div className="flex items-center justify-between">
          <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
            {formatDisplayDate(selectedDate)}
          </span>
          <Calendar className="w-4 h-4 text-gray-400" />
        </div>
      </button>

      {/* iOS-style Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-600/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-800/80">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            
            <h3 className="text-white font-semibold text-lg">
              {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h3>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 border-b border-gray-700/30 bg-gray-800/60">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-gray-400 text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 p-3 gap-1">
            {days.map((date, index) => (
              <div key={index} className="aspect-square">
                {date && (
                  <button
                    onClick={() => handleDateSelect(date)}
                    disabled={isDateDisabled(date)}
                    className={`
                      w-full h-full rounded-xl text-sm font-medium transition-all duration-200 transform
                      ${isSelected(date)
                        ? `${colors.accent} shadow-lg scale-105 ring-2 ring-white/20`
                        : isToday(date)
                        ? `${colors.hover} text-${color}-400 border border-${color}-500/30 scale-105`
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

          {/* Quick Actions */}
          <div className="p-3 border-t border-gray-700/30 flex gap-2 bg-gray-800/60">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all duration-200"
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              className="px-4 py-2 text-sm bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-xl transition-all duration-200"
            >
              Ngày mai
            </button>
            <div className="flex-1"></div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-xl transition-all duration-200"
              title="Đóng"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSDatePicker;
