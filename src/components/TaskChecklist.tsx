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
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

  // 🚀 Optimistic UI states
  const [optimisticItems, setOptimisticItems] = useState<ChecklistItem[]>([]);
  const [pendingOperations, setPendingOperations] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  // 🎯 Computed items list - kết hợp real items và optimistic items
  const displayItems = useMemo(() => {
    return [...items, ...optimisticItems].sort((a, b) => a.order_index - b.order_index);
  }, [items, optimisticItems]);

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

  const updateProgress = useCallback(async () => {
    try {
      const progressData = await checklistService.getChecklistProgress(taskId);
      setProgress(progressData);
      onProgressChange?.(progressData);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [taskId, onProgressChange]);

  const handleAddItem = useCallback(async () => {
    if (!newItemTitle.trim()) return;

    const trimmedTitle = newItemTitle.trim();
    const optimisticId = `optimistic-${Date.now()}`;

    // 🚀 Optimistic UI: Tạo item tạm thời ngay lập tức
    const optimisticItem: ChecklistItem = {
      id: optimisticId,
      task_id: taskId,
      title: trimmedTitle,
      is_completed: false,
      order_index: items.length + optimisticItems.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // 🎯 Hiển thị ngay lập tức (Optimistic UI)
      setOptimisticItems(prev => [...prev, optimisticItem]);
      setPendingOperations(prev => new Set([...prev, optimisticId]));
      setIsCreating(true);
      setNewItemTitle('');
      setAddingNew(false);

      // 🔄 Gọi API thực tế
      const newItem = await checklistService.createChecklistItem({
        taskId,
        title: trimmedTitle,
      });

      // ✅ Thành công: Thay thế optimistic item bằng real item
      setOptimisticItems(prev => prev.filter(item => item.id !== optimisticId));
      setItems(prev => [...prev, newItem]);
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticId);
        return newSet;
      });

      updateProgress();
    } catch (error) {
      console.error('Error adding item:', error);

      // ❌ Thất bại: Rollback optimistic UI
      setOptimisticItems(prev => prev.filter(item => item.id !== optimisticId));
      setPendingOperations(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticId);
        return newSet;
      });

      // Khôi phục form state để user có thể thử lại
      setNewItemTitle(trimmedTitle);
      setAddingNew(true);

      alert('Không thể thêm mục mới. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  }, [newItemTitle, taskId, items.length, optimisticItems.length, updateProgress]);

  const handleToggleItem = useCallback(
    async (itemId: string) => {
      // Skip nếu đang pending
      if (pendingOperations.has(itemId)) return;

      try {
        // 🚀 Optimistic UI: Cập nhật trạng thái ngay lập tức
        const currentItem = displayItems.find(item => item.id === itemId);
        if (!currentItem) return;

        const optimisticUpdate = { ...currentItem, is_completed: !currentItem.is_completed };

        // Cập nhật optimistic state
        setPendingOperations(prev => new Set([...prev, itemId]));
        setItems(prev => prev.map(item => (item.id === itemId ? optimisticUpdate : item)));

        // 🔄 Gọi API thực tế
        const updatedItem = await checklistService.toggleChecklistItem(itemId);

        // ✅ Thành công: Cập nhật với dữ liệu thực từ server
        setItems(prev => prev.map(item => (item.id === itemId ? updatedItem : item)));
        updateProgress();
      } catch (error) {
        console.error('Error toggling item:', error);

        // ❌ Thất bại: Rollback optimistic update
        const originalItem = items.find(item => item.id === itemId);
        if (originalItem) {
          setItems(prev => prev.map(item => (item.id === itemId ? originalItem : item)));
        }

        alert('Không thể cập nhật trạng thái');
      } finally {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [displayItems, items, pendingOperations, updateProgress]
  );

  const handleEditItem = useCallback(
    async (itemId: string) => {
      if (!editingTitle.trim()) return;

      const trimmedTitle = editingTitle.trim();
      const originalItem = items.find(item => item.id === itemId);
      if (!originalItem) return;

      try {
        // 🚀 Optimistic UI: Cập nhật title ngay lập tức
        const optimisticUpdate = { ...originalItem, title: trimmedTitle };

        setPendingOperations(prev => new Set([...prev, itemId]));
        setItems(prev => prev.map(item => (item.id === itemId ? optimisticUpdate : item)));
        setEditingId(null);
        setEditingTitle('');

        // 🔄 Gọi API thực tế
        const updatedItem = await checklistService.updateChecklistItem({
          id: itemId,
          title: trimmedTitle,
        });

        // ✅ Thành công: Cập nhật với dữ liệu thực từ server
        setItems(prev => prev.map(item => (item.id === itemId ? updatedItem : item)));
      } catch (error) {
        console.error('Error editing item:', error);

        // ❌ Thất bại: Rollback optimistic update
        setItems(prev => prev.map(item => (item.id === itemId ? originalItem : item)));

        // Khôi phục editing state để user có thể thử lại
        setEditingId(itemId);
        setEditingTitle(trimmedTitle);

        alert('Không thể cập nhật mục');
      } finally {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [editingTitle, items]
  );

  const handleDeleteItem = useCallback(
    async (itemId: string) => {
      if (!confirm('Bạn có chắc muốn xóa mục này?')) return;

      const itemToDelete = items.find(item => item.id === itemId);
      if (!itemToDelete) return;

      try {
        // 🚀 Optimistic UI: Xóa item ngay lập tức
        setPendingOperations(prev => new Set([...prev, itemId]));
        setItems(prev => prev.filter(item => item.id !== itemId));

        // 🔄 Gọi API thực tế
        await checklistService.deleteChecklistItem(itemId);

        // ✅ Thành công: Cập nhật progress
        updateProgress();
      } catch (error) {
        console.error('Error deleting item:', error);

        // ❌ Thất bại: Rollback - khôi phục item đã xóa
        setItems(prev => [...prev, itemToDelete].sort((a, b) => a.order_index - b.order_index));

        alert('Không thể xóa mục');
      } finally {
        setPendingOperations(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [items, updateProgress]
  );

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
    <div className="bg-gray-50 rounded-xl border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Danh sách công việc con</h3>
            <span className="text-sm text-gray-600 font-medium">
              ({progress.completed}/{progress.total})
            </span>
          </div>

          <button
            onClick={() => setAddingNew(true)}
            disabled={isCreating}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors shadow-sm ${
              isCreating ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Đang tạo...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Thêm mục</span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {progress.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ hoàn thành</span>
              <span className="font-medium">{progress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Add New Item */}
        {addingNew && (
          <div className="mb-4 p-3 bg-white rounded-lg border border-gray-300 shadow-sm">
            <div className="flex items-center gap-3">
              <Square className="w-5 h-5 text-gray-400" />
              <input
                ref={newItemInputRef}
                type="text"
                value={newItemTitle}
                onChange={e => setNewItemTitle(e.target.value)}
                placeholder="Nhập nội dung công việc con..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 border-none outline-none"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddItem();
                  if (e.key === 'Escape') cancelAdding();
                }}
              />
              <div className="flex items-center gap-1">
                <button
                  onClick={handleAddItem}
                  className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                  title="Lưu"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={cancelAdding}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Hủy"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Checklist Items với Optimistic UI */}
        {displayItems.length > 0 && (
          <div className="space-y-2">
            {displayItems.map(item => {
              const isPending = pendingOperations.has(item.id);
              const isOptimistic = item.id.startsWith('optimistic-');

              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    isOptimistic
                      ? 'animate-in slide-in-from-top-2 fade-in-0 bg-blue-50 border-blue-200 opacity-80'
                      : item.is_completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                  } ${isPending ? 'opacity-60 pointer-events-none' : ''}`}
                >
                  {/* Drag Handle */}
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-grab hover:text-gray-600" />

                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`flex-shrink-0 transition-colors ${
                      item.is_completed
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-400 hover:text-gray-600'
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
                        className="w-full bg-transparent text-gray-900 border-none outline-none"
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleEditItem(item.id);
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                    ) : (
                      <div>
                        <span
                          className={`block font-medium ${
                            item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}
                        >
                          {item.title}
                        </span>
                        {/* Hiển thị ngày tháng theo chuẩn Việt Nam */}
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <span className="text-gray-400">📅</span>
                            Tạo: {formatVietnameseDateTime(item.created_at)}
                          </span>
                          {item.is_completed && (
                            <span className="text-green-600 flex items-center gap-1">
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
                          className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                          title="Lưu"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                          title="Hủy"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startScheduling(item)}
                          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                          title="Lên lịch"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditing(item)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheduling Modal */}
      {schedulingItemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Lên lịch công việc con
            </h3>

            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Công việc</label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-900 border border-gray-200">
                  {items.find(i => i.id === schedulingItemId)?.title}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn ngày *</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={getMinDate()}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn giờ (tùy chọn)
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={e => setScheduleTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleScheduleItem}
                disabled={!scheduleDate}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Lưu lịch
              </button>
              <button
                onClick={cancelScheduling}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
