import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Simple validation
    if (!newPassword.trim()) {
      setErrors(['Vui lòng nhập mật khẩu mới']);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrors(['Mật khẩu xác nhận không khớp']);
      return;
    }

    if (newPassword.length < 6) {
      setErrors(['Mật khẩu phải có ít nhất 6 ký tự']);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call - In real app, call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('✅ Đổi mật khẩu thành công!\n\n🔒 Mật khẩu đã được cập nhật.');
      
      console.log('Password changed successfully');
      onSuccess();
      onClose();
      
      // Reset form
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      setErrors(['Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.']);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 modal-backdrop-enhanced modal-container-responsive z-50">
      <div className="create-task-modal bg-[#1a1f2e] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-700/50 modal-animate-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Đổi mật khẩu</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <div className="text-sm">
                  {errors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">
              Mật khẩu mới <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full px-4 py-3 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">
              Xác nhận mật khẩu <span className="text-red-400">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword.trim() || !confirmPassword.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang cập nhật...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
