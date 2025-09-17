import {
  Calendar,
  Check,
  CheckSquare,
  Edit3,
  GripVertical,
  Plus,
  Square,
  Trash2,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { ChecklistItem, ChecklistProgress, checklistService } from '../services/checklistService';
import { taskService } from '../services/taskService';

interface TaskChecklistProps {
  taskId: string;
  onProgressChange?: (progress: ChecklistProgress) => void;
}

const TaskChecklist: React.FC<TaskChecklistProps> = ({ taskId, onProgressChange }) => {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [progress, setProgress] = useState<ChecklistProgress>({
    total: 0,
    completed: 0,
    percentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [schedulingItemId, setSchedulingItemId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Helper function để format ngày tháng theo chuẩn Việt Nam
  const formatVietnameseDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'N/A';
    }
  };

  useEffect(() => {
    loadChecklistItems();
  }, [taskId]);

  useEffect(() => {
    if (addingNew && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [addingNew]);

  // Removed auto-show add form - user should click button to add items

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const loadChecklistItems = async () => {
    try {
      setLoading(true);
      const [itemsData, progressData] = await Promise.all([
        checklistService.getTaskChecklistItems(taskId),
        checklistService.getChecklistProgress(taskId),
      ]);

      setItems(itemsData);
      setProgress(progressData);
      onProgressChange?.(progressData);
    } catch (error) {
      console.error('Error loading checklist:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async () => {
    try {
      const progressData = await checklistService.getChecklistProgress(taskId);
      setProgress(progressData);
      onProgressChange?.(progressData);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handleAddItem = async () => {
    if (!newItemTitle.trim()) return;

    try {
      const newItem = await checklistService.createChecklistItem({
        taskId,
        title: newItemTitle.trim(),
      });

      setItems(prev => [...prev, newItem]);
      setNewItemTitle('');
      setAddingNew(false);
      updateProgress();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Không thể thêm mục mới');
    }
  };

  const handleToggleItem = async (itemId: string) => {
    try {
      const updatedItem = await checklistService.toggleChecklistItem(itemId);
      setItems(prev => prev.map(item => (item.id === itemId ? updatedItem : item)));
      updateProgress();
    } catch (error) {
      console.error('Error toggling item:', error);
      alert('Không thể cập nhật trạng thái');
    }
  };

  const handleEditItem = async (itemId: string) => {
    if (!editingTitle.trim()) return;

    try {
      const updatedItem = await checklistService.updateChecklistItem({
        id: itemId,
        title: editingTitle.trim(),
      });

      setItems(prev => prev.map(item => (item.id === itemId ? updatedItem : item)));
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Error editing item:', error);
      alert('Không thể cập nhật mục');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa mục này?')) return;

    try {
      await checklistService.deleteChecklistItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
      updateProgress();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Không thể xóa mục');
    }
  };

  const startEditing = (item: ChecklistItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const startScheduling = (item: ChecklistItem) => {
    setSchedulingItemId(item.id);
    setScheduleDate('');
    setScheduleTime('');
  };

  const cancelScheduling = () => {
    setSchedulingItemId(null);
    setScheduleDate('');
    setScheduleTime('');
  };

  const handleScheduleItem = async () => {
    if (!schedulingItemId || !scheduleDate) {
      alert('Vui lòng chọn ngày');
      return;
    }

    try {
      const item = items.find(i => i.id === schedulingItemId);
      if (!item) return;

      console.log('🗓️ Scheduling checklist item:', {
        itemId: schedulingItemId,
        itemTitle: item.title,
        scheduleDate,
        scheduleTime,
      });

      // Create a scheduled task for this checklist item
      await taskService.createScheduledChecklistItem({
        itemTitle: item.title,
        parentTaskId: taskId,
        checklistItemId: schedulingItemId,
        scheduledDate: scheduleDate,
        scheduledTime: scheduleTime || undefined,
      });

      alert(`✅ Đã lên lịch "${item.title}" vào ${scheduleDate} ${scheduleTime || ''}`);
      cancelScheduling();
    } catch (error) {
      console.error('Error scheduling checklist item:', error);
      alert('❌ Không thể lên lịch. Vui lòng thử lại.');
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDefaultTime = () => {
    const now = new Date();
    const hour = now.getHours() + 1;
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const cancelAdding = () => {
    setAddingNew(false);
    setNewItemTitle('');
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl border border-gray-700/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckSquare className="w-4 h-4 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Danh sách công việc con</h3>
        </div>
        <div className="text-center py-8 text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-2xl border border-gray-700/30">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Danh sách công việc con</h3>
            <span className="text-sm text-gray-400">
              ({progress.completed}/{progress.total})
            </span>
          </div>

          <button
            onClick={() => setAddingNew(true)}
            className="flex items-center gap-2 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">Thêm mục</span>
          </button>
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Tiến độ hoàn thành</span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Add New Item */}
        {addingNew && (
          <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-700/20">
            <div className="flex items-center gap-3">
              <Square className="w-5 h-5 text-gray-400" />
              <input
                ref={newItemInputRef}
                type="text"
                value={newItemTitle}
                onChange={e => setNewItemTitle(e.target.value)}
                placeholder="Nhập nội dung công việc con..."
                className="flex-1 bg-transparent text-white placeholder-gray-400 border-none outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') cancelAdding();
                }}
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddItem}
                  className="p-1 text-green-400 hover:text-green-300 transition-colors"
                  title="Lưu"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelAdding}
                  className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Items */}
        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  item.is_completed
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-gray-800/30 border-gray-700/20 hover:bg-gray-800/50'
                }`}
              >
                {/* Drag Handle */}
                <GripVertical className="w-4 h-4 text-gray-500 cursor-grab" />

                {/* Checkbox */}
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className={`flex-shrink-0 transition-colors ${
                    item.is_completed
                      ? 'text-green-400 hover:text-green-300'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {item.is_completed ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                {/* Content với ngày tháng */}
                <div className="flex-1 min-w-0">
                  {editingId === item.id ? (
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      className="w-full bg-transparent text-white border-none outline-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEditItem(item.id);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                  ) : (
                    <div>
                      <span
                        className={`block ${
                          item.is_completed ? 'text-gray-400 line-through' : 'text-white'
                        }`}
                      >
                        {item.title}
                      </span>
                      {/* Hiển thị ngày tháng theo chuẩn Việt Nam */}
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="text-gray-600">📅</span>
                          Tạo: {formatVietnameseDateTime(item.created_at)}
                        </span>
                        {item.is_completed && (
                          <span className="text-green-500 flex items-center gap-1">
                            <span>✅</span>
                            Hoàn thành: {formatVietnameseDateTime(item.updated_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {editingId === item.id ? (
                    <>
                      <button
                        onClick={() => handleEditItem(item.id)}
                        className="p-1 text-green-400 hover:text-green-300 transition-colors"
                        title="Lưu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                        title="Hủy"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startScheduling(item)}
                        className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                        title="Lên lịch"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => startEditing(item)}
                        className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                        title="Sửa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          !addingNew && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckSquare className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-gray-500 text-sm mb-3">Chưa có công việc con nào</p>
              <button
                onClick={() => setAddingNew(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Thêm công việc con đầu tiên</span>
              </button>
            </div>
          )
        )}
      </div>

      {/* Scheduling Modal */}
      {schedulingItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Lên lịch công việc con
            </h3>

            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Công việc</label>
                <div className="p-3 bg-gray-700/50 rounded-lg text-white">
                  {items.find(i => i.id === schedulingItemId)?.title}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Chọn ngày *</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chọn giờ (tùy chọn)
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleScheduleItem}
                disabled={!scheduleDate}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Lưu lịch
              </button>
              <button
                onClick={cancelScheduling}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskChecklist;
