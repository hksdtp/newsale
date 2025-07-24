import React, { useState } from 'react';
import { Search, Calendar, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { WORK_TYPES, WorkType } from '../data/dashboardMockData';

interface TaskFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  searchTerm: string;
  dateFilter: string;
  workTypeFilter: WorkType | 'all';
  priorityFilter: 'all' | 'low' | 'normal' | 'high';
  customDateRange?: {
    start: string;
    end: string;
  };
}

const TaskFilters: React.FC<TaskFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateFilter: 'all',
    workTypeFilter: 'all',
    priorityFilter: 'all'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const dateFilterOptions = [
    { value: 'all', label: 'Tất cả ngày' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'yesterday', label: 'Hôm qua' },
    { value: 'tomorrow', label: 'Ngày mai' },
    { value: 'last3days', label: '3 ngày trước' },
    { value: 'last5days', label: '5 ngày trước' },
    { value: 'last7days', label: '7 ngày trước' },
    { value: 'next3days', label: '3 ngày tới' },
    { value: 'next5days', label: '5 ngày tới' },
    { value: 'next7days', label: '7 ngày tới' },
    { value: 'thisWeek', label: 'Tuần này' },
    { value: 'thisMonth', label: 'Tháng này' },
    { value: 'thisYear', label: 'Năm này' },
    { value: 'custom', label: 'Tùy chọn' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'Tất cả mức độ' },
    { value: 'high', label: 'Ưu tiên cao' },
    { value: 'normal', label: 'Ưu tiên bình thường' },
    { value: 'low', label: 'Ưu tiên thấp' }
  ];

  const workTypeOptions = [
    { value: 'all', label: 'Tất cả loại công việc' },
    ...Object.entries(WORK_TYPES).map(([key, label]) => ({
      value: key,
      label: label
    }))
  ];

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      searchTerm: '',
      dateFilter: 'all',
      workTypeFilter: 'all',
      priorityFilter: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.dateFilter !== 'all' || 
    filters.workTypeFilter !== 'all' || 
    filters.priorityFilter !== 'all';

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-700/50 mb-4 overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center gap-2 p-3">
        {/* Search Bar - Compact */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:bg-gray-700"
          />
        </div>
        
        {/* Filter Toggle Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            hasActiveFilters 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Bộ lọc</span>
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {Object.values(filters).filter(v => v && v !== 'all').length}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Filters */}
      {isExpanded && (
        <div className="border-t border-gray-700/50 p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Quick Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Date Filter */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Thời gian</label>
              <select
                value={filters.dateFilter}
                onChange={(e) => updateFilters({ dateFilter: e.target.value })}
                className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {dateFilterOptions.slice(0, 8).map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Type Filter */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Loại công việc</label>
              <select
                value={filters.workTypeFilter}
                onChange={(e) => updateFilters({ workTypeFilter: e.target.value as WorkType | 'all' })}
                className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {workTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-gray-400 text-xs mb-1">Mức độ ưu tiên</label>
              <select
                value={filters.priorityFilter}
                onChange={(e) => updateFilters({ priorityFilter: e.target.value as 'all' | 'low' | 'normal' | 'high' })}
                className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-700/30">
            <div className="flex items-center gap-2">
              {/* Advanced Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors ${
                  showAdvanced 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Calendar className="w-3 h-3" />
                Nâng cao
                {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            
            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
              >
                <X className="w-3 h-3" />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Advanced Date Range */}
          {showAdvanced && filters.dateFilter === 'custom' && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-700/30">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={filters.customDateRange?.start || ''}
                  onChange={(e) => updateFilters({
                    customDateRange: {
                      ...filters.customDateRange,
                      start: e.target.value,
                      end: filters.customDateRange?.end || ''
                    }
                  })}
                  className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={filters.customDateRange?.end || ''}
                  onChange={(e) => updateFilters({
                    customDateRange: {
                      ...filters.customDateRange,
                      start: filters.customDateRange?.start || '',
                      end: e.target.value
                    }
                  })}
                  className="w-full px-2 py-1.5 bg-gray-700/50 border border-gray-600/50 rounded text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskFilters;
