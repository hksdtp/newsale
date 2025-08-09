import { AlertTriangle, CheckCircle, Mail, X } from 'lucide-react';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  if (!isOpen) return null;

  // Get current user email
  const getCurrentEmail = () => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.email || 'user@example.com';
      }
    } catch (error) {
      console.error('Error getting current email:', error);
    }
    return 'user@example.com';
  };

  const currentEmail = getCurrentEmail();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    // Validation
    if (!newEmail.trim()) {
      setErrors(['Vui lòng nhập email mới']);
      return;
    }

    if (!validateEmail(newEmail)) {
      setErrors(['Email không hợp lệ']);
      return;
    }

    if (newEmail === currentEmail) {
      setErrors(['Email mới phải khác email hiện tại']);
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - In real app, call your API here
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update user data in localStorage
      const savedUser = localStorage.getItem('auth_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        user.email = newEmail;
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      // Show success message
      alert(
        `✅ Đổi email thành công!\n\n📧 Email đã được cập nhật từ:\n${currentEmail}\n\nThành:\n${newEmail}`
      );

      console.log('Email changed successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error changing email:', error);
      setErrors(['Có lỗi xảy ra khi đổi email. Vui lòng thử lại.']);
    } finally {
      setLoading(false);
    }
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Đổi email</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Email Display */}
          <div className="mb-6">
            <p className="text-gray-300 mb-2">
              <span className="text-white font-medium">Email hiện tại:</span>
              <span className="ml-2 text-blue-400">{currentEmail}</span>
            </p>
          </div>

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

          {/* New Email Input */}
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">
              Email mới <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="Nhập email mới"
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
              disabled={loading || !newEmail.trim()}
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
                  Đổi email
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

export default ChangeEmailModal;
