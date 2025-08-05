import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Download, Eye, Trash2, Paperclip, Image, FileText, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load attachments on mount
  useEffect(() => {
    loadAttachments();
  }, [taskId]);

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
      <div className="bg-white/5 rounded-2xl border border-gray-700/30">
        {/* Header - Collapsible */}
        <div className="p-4 border-b border-gray-700/20">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-between hover:bg-gray-800/30 rounded-lg p-2 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Paperclip className="w-3 h-3 text-purple-400" />
              </div>
              <h3 className="text-base font-medium text-white">Tệp đính kèm</h3>
              <span className="text-xs text-gray-400">({attachments.length})</span>
            </div>

            <div className="flex items-center gap-2">
              {attachments.length > 0 && !isCollapsed && (
                <span className="text-xs text-gray-500">Tùy chọn</span>
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
        {isCollapsed && attachments.length > 0 && (
          <div className="px-4 pb-3">
            <div className="text-xs text-gray-400 flex items-center gap-4">
              <span>{attachments.length} tệp đính kèm</span>
              <span>•</span>
              <span>Click để xem chi tiết</span>
            </div>
          </div>
        )}

        {/* Content - Collapsible */}
        {!isCollapsed && (
          <div className="p-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragOver
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">
              Kéo thả file vào đây hoặc{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-purple-400 hover:text-purple-300 underline"
                disabled={uploading}
              >
                chọn file
              </button>
            </p>
            <p className="text-xs text-gray-500">
              Hỗ trợ: Ảnh, PDF, Word, Excel, Text (tối đa 50MB)
            </p>
            {uploading && (
              <div className="mt-3">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full animate-pulse w-1/2"></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">Đang tải lên...</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          />

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="mt-6 space-y-3">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700/20 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="text-gray-400">
                    {getFileIcon(attachment.file_type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {attachment.file_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {attachmentService.formatFileSize(attachment.file_size)} • {' '}
                      {new Date(attachment.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePreview(attachment)}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title={attachmentService.isImageFile(attachment.file_type) ? "Xem trước" : "Tải xuống"}
                    >
                      {attachmentService.isImageFile(attachment.file_type) ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewUrl && previewFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => {
                setPreviewUrl(null);
                setPreviewFile(null);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewUrl}
              alt={previewFile.file_name}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white p-4 rounded-b-lg">
              <p className="font-medium">{previewFile.file_name}</p>
              <p className="text-sm text-gray-300">
                {attachmentService.formatFileSize(previewFile.file_size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskAttachments;
