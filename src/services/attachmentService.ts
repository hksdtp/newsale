import { getCurrentUser } from '../data/usersMockData';
import { supabase } from '../shared/api/supabase';
import { storageService } from './storageService';

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface UploadAttachmentData {
  taskId: string;
  file: File;
}

export interface AttachmentUploadResult {
  success: boolean;
  attachment?: TaskAttachment;
  error?: string;
}

class AttachmentService {
  private readonly BUCKET_NAME = 'task-attachments';
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  // Validate file before upload
  private validateFile(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'File size exceeds 50MB limit' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  // Generate unique file path
  private generateFilePath(taskId: string, fileName: string, userId: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `tasks/${taskId}/${userId}/${timestamp}_${sanitizedFileName}`;
  }

  // Upload file to Supabase Storage
  async uploadAttachment(data: UploadAttachmentData): Promise<AttachmentUploadResult> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Validate file
      const validation = this.validateFile(data.file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate file path
      const filePath = this.generateFilePath(data.taskId, data.file.name, currentUser.id);

      // Upload to Supabase Storage (using storage service)
      const { data: uploadData, error: uploadError } = await storageService.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, data.file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        return { success: false, error: 'Failed to upload file to storage' };
      }

      // Save attachment record to database
      const { data: attachmentData, error: dbError } = await supabase
        .from('task_attachments')
        .insert({
          task_id: data.taskId,
          file_name: data.file.name,
          file_path: filePath,
          file_size: data.file.size,
          file_type: data.file.type,
          uploaded_by: currentUser.id,
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded file if database insert fails
        await storageService.storage.from(this.BUCKET_NAME).remove([filePath]);
        return { success: false, error: 'Failed to save attachment record' };
      }

      return { success: true, attachment: attachmentData };
    } catch (error) {
      console.error('Upload attachment error:', error);
      return { success: false, error: 'Unexpected error during upload' };
    }
  }

  // Get attachments for a task
  async getTaskAttachments(taskId: string): Promise<TaskAttachment[]> {
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attachments:', error);
        throw new Error('Failed to fetch attachments');
      }

      return data || [];
    } catch (error) {
      console.error('Get task attachments error:', error);
      throw error;
    }
  }

  // Get signed URL for file download
  async getAttachmentUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await storageService.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Get attachment URL error:', error);
      return null;
    }
  }

  // Delete attachment
  async deleteAttachment(attachmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      // Get attachment record first
      const { data: attachment, error: fetchError } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('id', attachmentId)
        .single();

      if (fetchError || !attachment) {
        return { success: false, error: 'Attachment not found' };
      }

      // Check if user can delete this attachment
      if (attachment.uploaded_by !== currentUser.id) {
        return { success: false, error: 'Not authorized to delete this attachment' };
      }

      // Delete from storage
      const { error: storageError } = await storageService.storage
        .from(this.BUCKET_NAME)
        .remove([attachment.file_path]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('task_attachments')
        .delete()
        .eq('id', attachmentId);

      if (dbError) {
        console.error('Database delete error:', dbError);
        return { success: false, error: 'Failed to delete attachment record' };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete attachment error:', error);
      return { success: false, error: 'Unexpected error during deletion' };
    }
  }

  // Get file type icon
  getFileTypeIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.startsWith('text/')) return '📄';
    return '📎';
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Check if file is image
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/');
  }
}

export const attachmentService = new AttachmentService();
