/**
 * Language constants for the application
 * Defines source language and localization settings
 */

// Source language identifier
export const SOURCE_LANG_VI = 'vi-VN';

// Language configuration
export const LANGUAGE_CONFIG = {
  DEFAULT_LOCALE: 'vi-VN',
  SUPPORTED_LOCALES: ['vi-VN', 'en-US'],
  DATE_FORMAT: 'dd/MM/yyyy',
  TIME_FORMAT: 'HH:mm',
  CURRENCY: 'VND',
} as const;

// Language labels
export const LANGUAGE_LABELS = {
  'vi-VN': 'Tiếng Việt',
  'en-US': 'English',
} as const;

// Common Vietnamese text constants
export const VI_TEXT = {
  // Task related
  TASK_TITLE: 'Tiêu đề công việc',
  TASK_DESCRIPTION: 'Mô tả công việc',
  TASK_STATUS: 'Trạng thái',
  TASK_PRIORITY: 'Độ ưu tiên',
  TASK_DUE_DATE: 'Hạn chót',
  TASK_ASSIGNED_TO: 'Người thực hiện',
  
  // Checklist related
  CHECKLIST_TITLE: 'Danh sách công việc con',
  ADD_ITEM: 'Thêm mục',
  CHECKLIST_ITEM: 'Mục công việc',
  COMPLETED: 'Hoàn thành',
  PENDING: 'Chờ xử lý',
  
  // Actions
  SAVE: 'Lưu',
  CANCEL: 'Hủy',
  DELETE: 'Xóa',
  EDIT: 'Chỉnh sửa',
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  
  // Status messages
  SUCCESS: 'Thành công',
  ERROR: 'Lỗi',
  WARNING: 'Cảnh báo',
  INFO: 'Thông tin',
  
  // Common phrases
  LOADING: 'Đang tải...',
  NO_DATA: 'Không có dữ liệu',
  CONFIRM_DELETE: 'Bạn có chắc chắn muốn xóa?',
  OPERATION_SUCCESS: 'Thao tác thành công',
  OPERATION_FAILED: 'Thao tác thất bại',
} as const;

// Export types
export type SupportedLocale = keyof typeof LANGUAGE_LABELS;
export type LanguageKey = keyof typeof VI_TEXT;
