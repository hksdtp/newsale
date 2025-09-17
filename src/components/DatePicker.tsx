import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { createLocalDate, formatLocalDateString } from '../utils/dateUtils';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minDate?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Chọn ngày',
  label,
  required = false,
  minDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? createLocalDate(value) : null
  );
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
    setIsOpen(false);
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
    if (!minDate) return false;
    const minDateObj = createLocalDate(minDate);
    if (!minDateObj) return false;
    return date.getTime() < minDateObj.getTime();
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

  // Calculate position when opening
  const toggleCalendar = () => {
    if (!isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Determine if should show above or below
      let top = rect.bottom + 8;
      if (top + 400 > viewportHeight && rect.top > 400) {
        // Show above if not enough space below
        top = rect.top - 400;
      }
      
      setCalendarPosition({
        top,
        left: rect.left,
        width: rect.width,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="block text-white font-medium mb-2">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}

      {/* Input Field */}
      <div
        ref={inputRef}
        onClick={toggleCalendar}
        className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white cursor-pointer hover:border-gray-500 transition-colors relative"
      >
        <div className="flex items-center justify-between">
          <span className={selectedDate ? 'text-white' : 'text-gray-400'}>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
          <Calendar className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Calendar Dropdown Portal */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed bg-gray-800 border border-gray-600 rounded-xl shadow-2xl z-[99999] overflow-hidden"
          style={{
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
            width: `${calendarPosition.width}px`,
            minWidth: '320px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            <h3 className="text-white font-semibold">
              {currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h3>

            <button
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 border-b border-gray-700">
            {weekDays.map(day => (
              <div key={day} className="p-3 text-center text-gray-400 text-sm font-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 p-2">
            {days.map((date, index) => (
              <div key={index} className="aspect-square p-1">
                {date && (
                  <button
                    onClick={() => handleDateSelect(date)}
                    disabled={isDateDisabled(date)}
                    className={`
                      w-full h-full rounded-lg text-sm font-medium transition-all duration-200
                      ${
                        isSelected(date)
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : isToday(date)
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : isDateDisabled(date)
                              ? 'text-gray-600 cursor-not-allowed'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
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
          <div className="p-3 border-t border-gray-700 flex gap-2">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Hôm nay
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                handleDateSelect(tomorrow);
              }}
              className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
            >
              Ngày mai
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default DatePicker;
