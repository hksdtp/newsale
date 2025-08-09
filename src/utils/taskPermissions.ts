import { getCurrentUser } from '../data/usersMockData';
import { TaskWithUsers } from '../services/taskService';

/**
 * Utility functions for task permissions
 * Chỉ người tạo công việc mới có quyền chỉnh sửa, xóa
 */

// Cache để lưu kết quả kiểm tra quyền (tối ưu hiệu suất)
const permissionCache = new Map<string, { permissions: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 phút

// Ghi log khi có người cố gắng truy cập trái phép
function logUnauthorizedAccess(action: string, taskId: string, userId: string, taskName: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    action: action, // hành động: "chỉnh sửa", "xóa", v.v.
    taskId: taskId,
    taskName: taskName,
    userId: userId,
    type: 'UNAUTHORIZED_ACCESS', // loại log
  };

  console.warn('🚨 Truy cập trái phép:', logEntry);

  // Có thể gửi lên server để lưu vào database
  // await sendAuditLog(logEntry);
}

/**
 * Kiểm tra xem user có quyền dựa trên vai trò (role-based)
 * @param userRole - Vai trò của user: 'admin', 'manager', 'employee'
 * @returns true nếu user có quyền quản lý tất cả tasks
 */
function hasAdminPermissions(userRole?: string): boolean {
  // Admin và Manager có thể chỉnh sửa tất cả công việc
  return userRole === 'admin' || userRole === 'manager' || userRole === 'retail_director';
}

/**
 * Kiểm tra xem user hiện tại có phải là chủ sở hữu của task không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional, sẽ lấy từ getCurrentUser nếu không có)
 * @returns true nếu user hiện tại là chủ sở hữu task
 */
export function isTaskOwner(task: TaskWithUsers, currentUserId?: string): boolean {
  try {
    // Lấy current user nếu không được truyền vào
    const currentUser = getCurrentUser();
    const userId = currentUserId || currentUser?.id;

    if (!userId || !task) {
      console.warn('⚠️ isTaskOwner: Missing userId or task');
      return false;
    }

    // Kiểm tra quyền admin/manager trước (họ có thể chỉnh sửa tất cả)
    if (hasAdminPermissions(currentUser?.role)) {
      console.log('👑 Admin/Manager có quyền chỉnh sửa tất cả tasks');
      return true;
    }

    // Kiểm tra xem user hiện tại có phải là người tạo task không
    const isOwner = task.created_by_id === userId;

    console.log('🔐 Task permission check:', {
      taskId: task.id,
      taskName: task.name,
      createdBy: task.created_by_id,
      currentUser: userId,
      userRole: currentUser?.role,
      isOwner: isOwner,
    });

    return isOwner;
  } catch (error) {
    console.error('❌ Error checking task ownership:', error);
    return false;
  }
}

/**
 * Kiểm tra xem user hiện tại có quyền chỉnh sửa task không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns true nếu user có quyền chỉnh sửa
 */
export function canEditTask(task: TaskWithUsers, currentUserId?: string): boolean {
  // Hiện tại chỉ chủ sở hữu mới có quyền chỉnh sửa
  return isTaskOwner(task, currentUserId);
}

/**
 * Kiểm tra xem user hiện tại có quyền xóa task không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns true nếu user có quyền xóa
 */
export function canDeleteTask(task: TaskWithUsers, currentUserId?: string): boolean {
  // Hiện tại chỉ chủ sở hữu mới có quyền xóa
  return isTaskOwner(task, currentUserId);
}

/**
 * Kiểm tra xem user hiện tại có quyền thay đổi trạng thái task không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns true nếu user có quyền thay đổi trạng thái
 */
export function canChangeTaskStatus(task: TaskWithUsers, currentUserId?: string): boolean {
  // Hiện tại chỉ chủ sở hữu mới có quyền thay đổi trạng thái
  return isTaskOwner(task, currentUserId);
}

/**
 * Kiểm tra xem user hiện tại có quyền thay đổi ưu tiên task không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns true nếu user có quyền thay đổi ưu tiên
 */
export function canChangePriority(task: TaskWithUsers, currentUserId?: string): boolean {
  // Hiện tại chỉ chủ sở hữu mới có quyền thay đổi ưu tiên
  return isTaskOwner(task, currentUserId);
}

/**
 * Kiểm tra xem user hiện tại có quyền thay đổi danh mục công việc không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns true nếu user có quyền thay đổi danh mục
 */
export function canChangeWorkType(task: TaskWithUsers, currentUserId?: string): boolean {
  // Hiện tại chỉ chủ sở hữu mới có quyền thay đổi danh mục
  return isTaskOwner(task, currentUserId);
}

/**
 * Kiểm tra xem user hiện tại có quyền assign task cho người khác không
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns true nếu user có quyền assign
 */
export function canAssignTask(task: TaskWithUsers, currentUserId?: string): boolean {
  // Hiện tại chỉ chủ sở hữu mới có quyền assign
  return isTaskOwner(task, currentUserId);
}

/**
 * Lấy thông tin quyền hạn của user đối với một task (có cache để tối ưu)
 * @param task - Task cần kiểm tra
 * @param currentUserId - ID của user hiện tại (optional)
 * @returns Object chứa tất cả quyền hạn
 */
export function getTaskPermissions(task: TaskWithUsers, currentUserId?: string) {
  const userId = currentUserId || getCurrentUser()?.id;
  const cacheKey = `${task.id}-${userId}`;

  // Kiểm tra cache trước (để tăng tốc độ)
  const cached = permissionCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Sử dụng cache cho permissions của task:', task.name);
    return cached.permissions;
  }

  const isOwner = isTaskOwner(task, currentUserId);

  const permissions = {
    isOwner,
    canEdit: canEditTask(task, currentUserId),
    canDelete: canDeleteTask(task, currentUserId),
    canChangeStatus: canChangeTaskStatus(task, currentUserId),
    canChangePriority: canChangePriority(task, currentUserId),
    canChangeWorkType: canChangeWorkType(task, currentUserId),
    canAssign: canAssignTask(task, currentUserId),
    // Quyền xem luôn có (vì đã thấy task trong list)
    canView: true,
  };

  // Lưu vào cache
  permissionCache.set(cacheKey, {
    permissions,
    timestamp: Date.now(),
  });

  return permissions;
}

/**
 * Xóa cache permissions khi có thay đổi (real-time updates)
 * @param taskId - ID của task bị thay đổi
 */
export function clearPermissionCache(taskId?: string) {
  if (taskId) {
    // Xóa cache cho task cụ thể
    for (const key of permissionCache.keys()) {
      if (key.startsWith(taskId)) {
        permissionCache.delete(key);
      }
    }
    console.log('🗑️ Đã xóa cache permissions cho task:', taskId);
  } else {
    // Xóa toàn bộ cache
    permissionCache.clear();
    console.log('🗑️ Đã xóa toàn bộ cache permissions');
  }
}

/**
 * Tạo thông báo lỗi khi user không có quyền (và ghi log)
 * @param action - Hành động user đang cố gắng thực hiện
 * @param taskName - Tên của task
 * @param taskId - ID của task (để ghi log)
 * @returns Thông báo lỗi
 */
export function getPermissionErrorMessage(
  action: string,
  taskName: string,
  taskId?: string
): string {
  const currentUser = getCurrentUser();

  // Ghi log truy cập trái phép
  if (taskId && currentUser?.id) {
    logUnauthorizedAccess(action, taskId, currentUser.id, taskName);
  }

  return `❌ Bạn không có quyền ${action} công việc "${taskName}". Chỉ người tạo công việc hoặc Admin/Manager mới có quyền thực hiện hành động này.`;
}

/**
 * Kiểm tra và thông báo lỗi nếu không có quyền
 * @param task - Task cần kiểm tra
 * @param action - Hành động cần thực hiện
 * @param requiredPermission - Quyền cần thiết (ví dụ: 'canEdit', 'canDelete')
 * @returns true nếu có quyền, false và hiện thông báo nếu không có quyền
 */
export function checkPermissionWithAlert(
  task: TaskWithUsers,
  action: string,
  requiredPermission: keyof ReturnType<typeof getTaskPermissions>
): boolean {
  const permissions = getTaskPermissions(task);

  if (!permissions[requiredPermission]) {
    alert(getPermissionErrorMessage(action, task.name, task.id));
    return false;
  }

  return true;
}
