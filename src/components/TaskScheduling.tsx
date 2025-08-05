import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Check, CalendarDays, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { schedulingService, ScheduledTask } from '../services/schedulingService';

interface TaskSchedulingProps {
  taskId: string;
  currentTask?: any;
  onScheduleChange?: (scheduled: boolean, scheduledDate?: string, scheduledTime?: string) => void;
}

const TaskScheduling: React.FC<TaskSchedulingProps> = ({ 
  taskId, 
  currentTask, 
  onScheduleChange 
}) => {
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [tempTime, setTempTime] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed

  useEffect(() => {
    if (currentTask) {
      const scheduled = schedulingService.isTaskScheduled(currentTask);
      setIsScheduled(scheduled);
      if (scheduled) {
        setScheduledDate(currentTask.scheduled_date);
        setScheduledTime(currentTask.scheduled_time || '');
      }
    }
  }, [currentTask]);

  const handleScheduleTask = async () => {
    if (!tempDate) {
      alert('Vui lòng chọn ngày');
      return;
    }

    try {
      setLoading(true);

      console.log('🔧 TaskScheduling: Scheduling task with data:', {
        taskId,
        scheduledDate: tempDate,
        scheduledTime: tempTime,
        dateFormat: 'Should be YYYY-MM-DD',
        inputValue: tempDate,
        parsedAsDate: new Date(tempDate + 'T00:00:00'),
        localDateString: new Date(tempDate + 'T00:00:00').toLocaleDateString('vi-VN'),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });

      const result = await schedulingService.scheduleTask({
        taskId,
        scheduledDate: tempDate,
        scheduledTime: tempTime || undefined
      });

      if (result.success && result.task) {
        setIsScheduled(true);
        setScheduledDate(result.task.scheduled_date);
        setScheduledTime(result.task.scheduled_time || '');
        setShowScheduleForm(false);
        setTempDate('');
        setTempTime('');
        onScheduleChange?.(true, result.task.scheduled_date, result.task.scheduled_time);
      } else {
        alert(result.error || 'Không thể lên lịch công việc');
      }
    } catch (error) {
      console.error('Schedule error:', error);
      alert('Có lỗi xảy ra khi lên lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleUnscheduleTask = async () => {
    if (!confirm('Bạn có chắc muốn hủy lịch cho công việc này?')) return;

    try {
      setLoading(true);
      const result = await schedulingService.unscheduleTask(taskId);

      if (result.success) {
        setIsScheduled(false);
        setScheduledDate('');
        setScheduledTime('');
        onScheduleChange?.(false);
      } else {
        alert(result.error || 'Không thể hủy lịch công việc');
      }
    } catch (error) {
      console.error('Unschedule error:', error);
      alert('Có lỗi xảy ra khi hủy lịch');
    } finally {
      setLoading(false);
    }
  };

  const formatScheduledDateTime = () => {
    if (!scheduledDate) return '';
    
    return schedulingService.formatScheduledDate(scheduledDate, scheduledTime);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDefaultTime = () => {
    const now = new Date();
    const hour = now.getHours() + 1; // Next hour
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const isTaskFromSchedule = currentTask && schedulingService.isTaskFromSchedule(currentTask);

  return (
    <div className="bg-white/5 rounded-2xl border border-gray-700/30">
      {/* Header - Collapsible */}
      <div className="p-4 border-b border-gray-700/20">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-between hover:bg-gray-800/30 rounded-lg p-2 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <CalendarDays className="w-3 h-3 text-blue-400" />
            </div>
            <h3 className="text-base font-medium text-white">Lên lịch công việc</h3>
            {isTaskFromSchedule && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                Từ kế hoạch
              </span>
            )}
            {isScheduled && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Đã lên lịch
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isCollapsed && !isScheduled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowScheduleForm(true);
                  setTempDate(getMinDate());
                  setTempTime(getDefaultTime());
                }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            )}
            {isCollapsed && !isScheduled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCollapsed(false);
                  setShowScheduleForm(true);
                  setTempDate(getMinDate());
                  setTempTime(getDefaultTime());
                }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            )}
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </button>
      </div>

      {/* Collapsed Summary */}
      {isCollapsed && (
        <div className="px-4 pb-3">
          <div className="text-xs text-gray-400 flex items-center gap-4">
            {isScheduled ? (
              <>
                <span>📅 {formatScheduledDateTime()}</span>
                <span>•</span>
                <span>Click để chỉnh sửa</span>
              </>
            ) : (
              <>
                <span>Chưa lên lịch</span>
                <span>•</span>
                <span>Click để thêm vào kế hoạch</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Content - Collapsible */}
      {!isCollapsed && (
        <div className="p-6">
        {/* Current Schedule Display */}
        {isScheduled && !showScheduleForm && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Đã lên lịch</p>
                <p className="text-blue-300 text-sm">{formatScheduledDateTime()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowScheduleForm(true);
                    setTempDate(scheduledDate.split('T')[0]);
                    setTempTime(scheduledTime);
                  }}
                  className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                  title="Chỉnh sửa lịch"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={handleUnscheduleTask}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Hủy lịch"
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              <p>💡 <strong>Mẹo:</strong> Công việc sẽ tự động xuất hiện trong danh sách công việc của bạn vào ngày đã lên lịch.</p>
            </div>
          </div>
        )}

        {/* Schedule Form */}
        {showScheduleForm && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn ngày
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    min={getMinDate()}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn giờ (tùy chọn)
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="time"
                    value={tempTime}
                    onChange={(e) => setTempTime(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            {tempDate && (
              <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/20">
                <p className="text-sm text-gray-400 mb-1">Xem trước:</p>
                <p className="text-white">
                  {schedulingService.formatScheduledDate(tempDate, tempTime)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleScheduleTask}
                disabled={!tempDate || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{loading ? 'Đang lưu...' : (isScheduled ? 'Cập nhật lịch' : 'Lưu lịch')}</span>
              </button>
              
              <button
                onClick={() => {
                  setShowScheduleForm(false);
                  setTempDate('');
                  setTempTime('');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Hủy</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isScheduled && !showScheduleForm && (
          <div className="text-center py-8">
            <CalendarDays className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Công việc chưa được lên lịch</p>
            <p className="text-sm text-gray-500 mb-6">
              Thêm công việc này vào kế hoạch để tự động nhận nhắc nhở vào ngày đã định
            </p>
            <button
              onClick={() => {
                setShowScheduleForm(true);
                setTempDate(getMinDate());
                setTempTime(getDefaultTime());
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm vào kế hoạch</span>
            </button>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default TaskScheduling;
