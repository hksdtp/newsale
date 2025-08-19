import { createClient } from '@supabase/supabase-js';

/**
 * 🔑 STORAGE SERVICE WITH SERVICE KEY
 * Workaround for RLS issues - uses service key for storage operations
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const serviceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing Supabase service key configuration');
  throw new Error('Missing Supabase service key configuration');
}

// Create client with service key for storage operations
const storageClient = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export class StorageService {
  private readonly BUCKET_NAME = 'task-attachments';

  // Expose storage client for direct access (compatibility)
  get storage() {
    return storageClient.storage;
  }

  // Upload file using service key
  async uploadFile(
    filePath: string,
    file: File
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await storageClient.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('Storage upload error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Upload error:', err);
      return { success: false, error: 'Upload failed' };
    }
  }

  // Get signed URL for download
  async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
    try {
      const { data, error } = await storageClient.storage
        .from(this.BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return null;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Signed URL error:', err);
      return null;
    }
  }

  // Delete file
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await storageClient.storage.from(this.BUCKET_NAME).remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('Delete error:', err);
      return { success: false, error: 'Delete failed' };
    }
  }
}

export const storageService = new StorageService();
