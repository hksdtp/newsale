import { supabase } from '../shared/api/supabase';

export interface AvatarUploadResult {
  success: boolean;
  avatarUrl?: string;
  error?: string;
}

export class AvatarService {
  private static readonly BUCKET_NAME = 'product-images'; // Sử dụng bucket có sẵn
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  /**
   * Upload avatar file to Supabase Storage
   */
  static async uploadAvatar(file: File, userId: string): Promise<AvatarUploadResult> {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `avatars/${userId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from(this.BUCKET_NAME).upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

      if (error) {
        console.error('Supabase upload error:', error);
        return { success: false, error: 'Không thể upload avatar. Vui lòng thử lại.' };
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName);

      if (!urlData?.publicUrl) {
        return { success: false, error: 'Không thể tạo URL cho avatar.' };
      }

      // Update user avatar_url in database
      const updateResult = await this.updateUserAvatar(userId, urlData.publicUrl);
      if (!updateResult.success) {
        return { success: false, error: updateResult.error };
      }

      return { success: true, avatarUrl: urlData.publicUrl };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return { success: false, error: 'Có lỗi xảy ra khi upload avatar.' };
    }
  }

  /**
   * Update user avatar URL in database
   */
  private static async updateUserAvatar(
    userId: string,
    avatarUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ avatar_url: avatarUrl })
        .eq('id', userId);

      if (error) {
        console.error('Database update error:', error);
        return { success: false, error: 'Không thể cập nhật avatar trong database.' };
      }

      return { success: true };
    } catch (error) {
      console.error('Update avatar error:', error);
      return { success: false, error: 'Có lỗi xảy ra khi cập nhật avatar.' };
    }
  }

  /**
   * Get user avatar URL from database
   */
  static async getUserAvatar(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return null;
      }

      return data.avatar_url;
    } catch (error) {
      console.error('Get avatar error:', error);
      return null;
    }
  }

  /**
   * Delete old avatar from storage
   */
  static async deleteAvatar(avatarUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const url = new URL(avatarUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts.slice(-3).join('/'); // Get last 3 parts: avatars/userId/filename

      const { error } = await supabase.storage.from(this.BUCKET_NAME).remove([fileName]);

      if (error) {
        console.error('Delete avatar error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Delete avatar error:', error);
      return false;
    }
  }

  /**
   * Validate uploaded file
   */
  private static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'Kích thước file không được vượt quá 5MB.' };
    }

    // Check file type
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Chỉ hỗ trợ file ảnh (JPEG, PNG, WebP, GIF).' };
    }

    return { valid: true };
  }

  /**
   * Resize image before upload (optional)
   */
  static async resizeImage(
    file: File,
    maxWidth: number = 400,
    maxHeight: number = 400
  ): Promise<File> {
    return new Promise(resolve => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          blob => {
            if (blob) {
              const resizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(resizedFile);
            } else {
              resolve(file);
            }
          },
          file.type,
          0.8
        ); // 80% quality
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export default AvatarService;
