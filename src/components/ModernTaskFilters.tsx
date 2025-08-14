import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp,
  Building,
  Target,
  User,
  Users,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { WORK_TYPES, WorkType } from '../data/dashboardMockData';
import IOSDatePicker from './IOSDatePicker';

interface ModernTaskFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  quickStatusFilter: 'all' | 'new-requests' | 'approved' | 'live';
  onQuickStatusChange: (status: 'all' | 'new-requests' | 'approved' | 'live') => void;
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

const ModernTaskFilters: React.FC<ModernTaskFiltersProps> = ({ 
  onFilterChange, 
  quickStatusFilter, 
  onQuickStatusChange 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    dateFilter: 'all',
    workTypeFilter: 'all',
    priorityFilter: 'all'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Quick Status Options với icons và colors
  const quickStatusOptions = [
    { 
      value: 'all', 
      label: 'Tất cả', 
      icon: Filter, 
      color: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      activeColor: 'bg-gray-500/30 text-white border-gray-400'
    },
    { 
      value: 'new-requests', 
      label: 'Chưa tiến hành', 
      icon: Clock, 
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      activeColor: 'bg-yellow-500/30 text-yellow-100 border-yellow-400'
    },
    { 
      value: 'approved', 
      label: 'Đang tiến hành', 
      icon: AlertTriangle, 
      color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      activeColor: 'bg-blue-500/30 text-blue-100 border-blue-400'
    },
    { 
      value: 'live', 
      label: 'Đã hoàn thành', 
      icon: CheckCircle, 
      color: 'bg-green-500/20 text-green-300 border-green-500/30',
      activeColor: 'bg-green-500/30 text-green-100 border-green-400'
    }
  ];

  // Priority Options với colors
  const priorityOptions = [
    { value: 'all', label: 'Tất cả mức độ', color: 'text-gray-400' },
    { value: 'high', label: 'Ưu tiên cao', color: 'text-red-400' },
    { value: 'normal', label: 'Ưu tiên bình thường', color: 'text-yellow-400' },
    { value: 'low', label: 'Ưu tiên thấp', color: 'text-green-400' }
  ];

  // Work Type Options với icons
  const workTypeOptions = [
    { value: 'all', label: 'Tất cả loại', icon: Building },
    { value: 'sbg-new', label: 'SBG mới', icon: Building },
    { value: 'sbg-old', label: 'SBG cũ', icon: Building },
    { value: 'partner-new', label: 'Đối tác mới', icon: Users },
    { value: 'partner-old', label: 'Đối tác cũ', icon: Users },
    { value: 'kts-new', label: 'KTS mới', icon: Target },
    { value: 'kts-old', label: 'KTS cũ', icon: Target },
    { value: 'customer-new', label: 'Khách hàng mới', icon: User },
    { value: 'customer-old', label: 'Khách hàng cũ', icon: User },
    { value: 'other', label: 'Khác', icon: Building }
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
    onQuickStatusChange('all');
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.dateFilter !== 'all' || 
    filters.workTypeFilter !== 'all' || 
    filters.priorityFilter !== 'all' ||
    quickStatusFilter !== 'all';

  const activeFilterCount = [
    filters.searchTerm,
    filters.dateFilter !== 'all' ? filters.dateFilter : null,
    filters.workTypeFilter !== 'all' ? filters.workTypeFilter : null,
    filters.priorityFilter !== 'all' ? filters.priorityFilter : null,
    quickStatusFilter !== 'all' ? quickStatusFilter : null
  ].filter(Boolean).length;

  return (
    <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl border border-gray-700/30 mb-6 overflow-hidden shadow-2xl">
      {/* Main Filter Bar - iOS Style */}
      <div className="p-4 space-y-4">
        {/* Search Bar - Prominent */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc, người tạo, người thực hiện..."
            value={filters.searchTerm}
            onChange={(e) => updateFilters({ searchTerm: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-blue-500/50 focus:outline-none focus:bg-gray-700/70 transition-all duration-200"
          />
        </div>

        {/* Quick Status Filters - Integrated */}
        <div className="space-y-2">
          <label className="block text-gray-400 text-sm font-medium">Trạng thái</label>
          <div className="flex flex-wrap gap-2">
            {quickStatusOptions.map((option) => {
              const Icon = option.icon;
              const isActive = quickStatusFilter === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => onQuickStatusChange(option.value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all duration-200 hover:scale-105 ${
                    isActive ? option.activeColor : option.color
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              showAdvanced || hasActiveFilters
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'bg-gray-700/50 text-gray-300 border border-gray-600/50 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Bộ lọc nâng cao</span>
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {activeFilterCount}
              </span>
            )}
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Xóa bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters - Expandable */}
      {showAdvanced && (
        <div className="border-t border-gray-700/30 p-4 space-y-4 bg-gray-800/20 animate-in slide-in-from-top-2 duration-300">
          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Work Type Filter */}
            <div className="space-y-2">
              <label className="block text-gray-400 text-sm font-medium">Loại công việc</label>
              <select
                value={filters.workTypeFilter}
                onChange={(e) => updateFilters({ workTypeFilter: e.target.value as WorkType | 'all' })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white text-sm focus:border-blue-500/50 focus:outline-none appearance-none"
              >
                {workTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <label className="block text-gray-400 text-sm font-medium">Mức độ ưu tiên</label>
              <select
                value={filters.priorityFilter}
                onChange={(e) => updateFilters({ priorityFilter: e.target.value as 'all' | 'low' | 'normal' | 'high' })}
                className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white text-sm focus:border-blue-500/50 focus:outline-none appearance-none"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="block text-gray-400 text-sm font-medium">Khoảng thời gian</label>
              <div className="grid grid-cols-2 gap-2">
                <IOSDatePicker
                  value={filters.customDateRange?.start || ''}
                  onChange={(date) => updateFilters({
                    customDateRange: {
                      ...filters.customDateRange,
                      start: date.split('T')[0],
                      end: filters.customDateRange?.end || ''
                    }
                  })}
                  placeholder="Từ ngày"
                  isOpen={showDatePicker}
                  onToggle={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowEndDatePicker(false);
                  }}
                  onClose={() => setShowDatePicker(false)}
                  color="blue"
                  buttonClassName="text-sm py-2"
                />
                
                <IOSDatePicker
                  value={filters.customDateRange?.end || ''}
                  onChange={(date) => updateFilters({
                    customDateRange: {
                      ...filters.customDateRange,
                      start: filters.customDateRange?.start || '',
                      end: date.split('T')[0]
                    }
                  })}
                  placeholder="Đến ngày"
                  isOpen={showEndDatePicker}
                  onToggle={() => {
                    setShowEndDatePicker(!showEndDatePicker);
                    setShowDatePicker(false);
                  }}
                  onClose={() => setShowEndDatePicker(false)}
                  color="blue"
                  buttonClassName="text-sm py-2"
                  minDate={filters.customDateRange?.start}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTaskFilters;
