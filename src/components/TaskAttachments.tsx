import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileText,
  Image,
  Paperclip,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { attachmentService, TaskAttachment } from '../services/attachmentService';

interface TaskAttachmentsProps {
  taskId: string;
  onAttachmentsChange?: (attachments: TaskAttachment[]) => void;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId, onAttachmentsChange }) => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<TaskAttachment | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Start expanded for better UX
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load attachments on mount
  useEffect(() => {
    loadAttachments();
  }, [taskId]);

  // Keyboard support cho preview modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && previewUrl) {
        setPreviewUrl(null);
        setPreviewFile(null);
      }
    };

    if (previewUrl) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewUrl]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getTaskAttachments(taskId);
      setAttachments(data);
      onAttachmentsChange?.(data);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach(file => {
      uploadFile(file);
    });
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      const result = await attachmentService.uploadAttachment({ taskId, file });

      if (result.success && result.attachment) {
        setAttachments(prev => [result.attachment!, ...prev]);
        onAttachmentsChange?.([result.attachment!, ...attachments]);
      } else {
        alert(result.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Bạn có chắc muốn xóa file này?')) return;

    try {
      const result = await attachmentService.deleteAttachment(attachmentId);
      if (result.success) {
        const newAttachments = attachments.filter(a => a.id !== attachmentId);
        setAttachments(newAttachments);
        onAttachmentsChange?.(newAttachments);
      } else {
        alert(result.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file');
    }
  };

  const handlePreview = async (attachment: TaskAttachment) => {
    if (!attachmentService.isImageFile(attachment.file_type)) {
      // For non-images, download instead
      handleDownload(attachment);
      return;
    }

    try {
      const url = await attachmentService.getAttachmentUrl(attachment.file_path);
      if (url) {
        setPreviewUrl(url);
        setPreviewFile(attachment);
      }
    } catch (error) {
      console.error('Preview error:', error);
    }
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      const url = await attachmentService.getAttachmentUrl(attachment.file_path);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
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
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <Paperclip className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white/5 rounded-2xl border border-gray-700/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
            <Paperclip className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Tệp đính kèm</h3>
        </div>
        <div className="text-center py-8 text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 rounded-xl border border-gray-200">
        {/* Header - Compact và Collapsible */}
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center">
                <Paperclip className="w-3 h-3 text-purple-600" />
              </div>
              <h3 className="text-sm font-medium text-black">Tệp đính kèm</h3>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {attachments.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {uploading && (
                <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              )}
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </button>
        </div>

        {/* Collapsed Summary */}
        {isCollapsed && attachments.length > 0 && (
          <div className="px-4 pb-3">
            <div className="text-xs text-gray-500 flex items-center gap-4">
              <span>{attachments.length} tệp đính kèm</span>
              <span>•</span>
              <span>Click để xem chi tiết</span>
            </div>
          </div>
        )}

        {/* Content - Collapsible */}
        {!isCollapsed && (
          <div className="p-4">
            {/* Upload Area - Compact */}
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragOver
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Kéo thả file hoặc{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-purple-600 hover:text-purple-700 underline"
                  disabled={uploading}
                >
                  chọn file
                </button>
              </p>
              <p className="text-xs text-gray-500">Ảnh, PDF, Word, Excel, Text (≤50MB)</p>
              {uploading && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-gray-600">Đang tải lên...</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={e => handleFileSelect(e.target.files)}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />

            {/* Attachments List - Compact */}
            {attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachments.map(attachment => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-gray-500 flex-shrink-0">
                      {getFileIcon(attachment.file_type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-black font-medium truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachmentService.formatFileSize(attachment.file_size)} •{' '}
                        {new Date(attachment.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => handlePreview(attachment)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title={
                          attachmentService.isImageFile(attachment.file_type)
                            ? 'Xem trước'
                            : 'Tải xuống'
                        }
                      >
                        {attachmentService.isImageFile(attachment.file_type) ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(attachment.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Preview Modal - Cải thiện với nút đóng rõ ràng */}
      {previewUrl && previewFile && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setPreviewUrl(null);
            setPreviewFile(null);
          }}
        >
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            {/* Nút đóng cải thiện - dễ nhìn và click hơn */}
            <button
              onClick={() => {
                setPreviewUrl(null);
                setPreviewFile(null);
              }}
              className="absolute -top-12 right-0 bg-black/50 hover:bg-black/70 text-white hover:text-gray-300 rounded-full p-2 transition-all duration-200 backdrop-blur-sm border border-gray-600"
              title="Đóng (ESC)"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Nút đóng phụ ở góc trên phải của ảnh */}
            <button
              onClick={() => {
                setPreviewUrl(null);
                setPreviewFile(null);
              }}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full p-1.5 transition-all duration-200 z-10"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>

            <img
              src={previewUrl}
              alt={previewFile.file_name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 rounded-b-lg">
              <p className="font-medium">{previewFile.file_name}</p>
              <p className="text-sm text-gray-300">
                {attachmentService.formatFileSize(previewFile.file_size)} •{' '}
                {new Date(previewFile.created_at).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskAttachments;
