import { AlertTriangle, Camera, Check, RotateCcw, Upload, X } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Get current user avatar
  const getCurrentAvatar = () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.avatar || null;
      }
    } catch (error) {
      console.error('Error getting current avatar:', error);
    }
    return null;
  };

  const currentAvatar = getCurrentAvatar();

  // Generate avatar initials
  const getAvatarInitials = () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return (
          user.name
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U'
        );
      }
    } catch (error) {
      console.error('Error getting user name:', error);
    }
    return 'U';
  };

  const validateFile = (file: File): string[] => {
    const errors = [];

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Chỉ hỗ trợ file JPG, PNG, GIF');
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      errors.push('Kích thước file không được vượt quá 5MB');
    }

    return errors;
  };

  const handleFileSelect = (file: File) => {
    const validationErrors = validateFile(file);

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setSelectedFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrors(['Vui lòng chọn ảnh để upload']);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // TODO: Implement actual avatar upload API call
      // const formData = new FormData();
      // formData.append('avatar', selectedFile);
      // const response = await uploadAvatar(formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, just update localStorage with preview URL
      try {
        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          user.avatar = previewUrl; // In real app, this would be the uploaded URL
          localStorage.setItem('auth_user', JSON.stringify(user));
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }

      alert(
        '✅ Đổi avatar thành công!\n\n📷 Avatar mới đã được cập nhật và sẽ hiển thị trên toàn bộ hệ thống.'
      );

      onSuccess();
      onClose();

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setErrors(['Có lỗi xảy ra khi upload avatar. Vui lòng thử lại.']);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return createPortal(
    <div
      className="fixed inset-0 modal-backdrop-enhanced modal-container-responsive"
      style={{ zIndex: 1000000 }}
    >
      <div className="create-task-modal bg-[#1a1f2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-700/50 modal-animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Đổi avatar</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="create-task-modal-content overflow-y-auto modal-scrollbar">
          <div className="p-6 space-y-6">
            {/* Error Messages */}
            {errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Có lỗi xảy ra:</h4>
                    <ul className="text-red-300 text-sm space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Current Avatar */}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">Avatar hiện tại:</p>
              <div className="w-20 h-20 mx-auto mb-4">
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt="Current avatar"
                    className="w-full h-full rounded-full object-cover border-2 border-gray-600"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
                    {getAvatarInitials()}
                  </div>
                )}
              </div>
            </div>

            {/* File Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full rounded-full object-cover border-2 border-blue-500"
                    />
                  </div>
                  {selectedFile && (
                    <div className="text-gray-400 text-sm">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p>{formatFileSize(selectedFile.size)}</p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Chọn ảnh khác
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-700 rounded-full flex items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium mb-2">Kéo thả ảnh vào đây hoặc</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Chọn ảnh
                    </button>
                  </div>
                  <div className="text-gray-400 text-sm">
                    <p>Hỗ trợ: JPG, PNG, GIF</p>
                    <p>Kích thước tối đa: 5MB</p>
                    <p>Khuyến nghị: 200x200px</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Upload Tips */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Camera className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-300 text-sm">
                  <p className="font-medium mb-1">Mẹo chọn ảnh đẹp:</p>
                  <ul className="space-y-1">
                    <li>• Chọn ảnh có khuôn mặt rõ nét, không bị mờ</li>
                    <li>• Ảnh vuông (1:1) sẽ hiển thị đẹp nhất</li>
                    <li>• Tránh ảnh quá tối hoặc quá sáng</li>
                    <li>• Avatar sẽ hiển thị trên toàn bộ hệ thống</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                disabled={loading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={loading || !selectedFile}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang upload...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Cập nhật avatar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChangeAvatarModal;
