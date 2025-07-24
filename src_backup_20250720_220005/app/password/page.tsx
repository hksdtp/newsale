'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PasswordPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'người dùng';

  // Extract name from email for display
  const getDisplayName = (email: string) => {
    if (email === 'người dùng') return 'người dùng';
    const localPart = email.split('@')[0];
    // Capitalize first letter and replace dots/underscores with spaces
    return localPart.charAt(0).toUpperCase() + localPart.slice(1).replace(/[._]/g, ' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Đăng nhập với:', { email, password });
    setIsLoading(false);
    
    // Redirect to dashboard or success page
    alert('Đăng nhập thành công!');
  };

  const handleBack = () => {
    router.back();
  };

  const handleForgotPassword = () => {
    alert('Chức năng quên mật khẩu sẽ được triển khai sau');
  };

  const handleMoreOptions = () => {
    alert('Các tùy chọn khác sẽ được triển khai sau');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Uber logo */}
      <header className="bg-black text-white p-4">
        <div className="flex items-center">
          <span className="text-xl font-bold">Uber</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              Chào mừng trở lại, {getDisplayName(email)}.
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full px-4 py-4 text-lg border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Tôi quên mật khẩu
              </button>
              
              <button
                type="button"
                onClick={handleMoreOptions}
                className="block text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Tùy chọn khác
              </button>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={handleBack}
                className="p-3 rounded-full hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="submit"
                disabled={!password || isLoading}
                className="bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  'Tiếp tục →'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-bold mr-2">Uber</span>
            <span className="text-sm font-bold">Uber</span>
          </div>
          <div className="flex items-center text-sm text-gray-300">
            <span>curated by</span>
            <span className="ml-2 font-semibold text-white">Mobbin</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
