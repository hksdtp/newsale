import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { authService } from '../../../api/authService';

export function DirectorLoginPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [directors, setDirectors] = useState<any[]>([]);
  const [selectedDirector, setSelectedDirector] = useState<any>(null);
  const [showDirectorSelection, setShowDirectorSelection] = useState(true);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const loadDirectors = async () => {
      try {
        const directorsData = await authService.getDirectors();
        setDirectors(directorsData);

        // If only one director, auto-select
        if (directorsData.length === 1) {
          setSelectedDirector(directorsData[0]);
          setShowDirectorSelection(false);
        }
      } catch (error) {
        console.error('Failed to load directors:', error);
      }
    };

    loadDirectors();
  }, []);

  const handleDirectorSelect = (director: any) => {
    setSelectedDirector(director);
    setShowDirectorSelection(false);
  };

  const handleBackToSelection = () => {
    setSelectedDirector(null);
    setShowDirectorSelection(true);
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDirector) return;

    setIsLoading(true);

    try {
      await login(selectedDirector.email, password);

      // Check if needs password change
      const needsChange = await authService.needsPasswordChange(selectedDirector.email);
      if (needsChange) {
        navigate(`/auth/change-password?email=${encodeURIComponent(selectedDirector.email)}&name=${encodeURIComponent(selectedDirector.name)}`);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert(error instanceof Error ? error.message : 'Đăng nhập thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  if (directors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  // Show director selection if multiple directors or no director selected
  if (showDirectorSelection && directors.length > 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="p-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-medium text-gray-900 mb-4">
                Chọn Trưởng Phòng Kinh Doanh
              </h1>
              <p className="text-gray-600">
                Vui lòng chọn tài khoản để đăng nhập
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {directors.map((director) => (
                <button
                  key={director.id}
                  onClick={() => handleDirectorSelect(director)}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                      {director.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {director.name}
                      </h3>
                      <p className="text-sm text-gray-600">{director.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {director.department_type} • {director.location}
                      </p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="p-6">
          {/* Empty footer for spacing */}
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <button
          onClick={directors.length > 1 ? handleBackToSelection : handleBack}
          className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {directors.length > 1 ? 'Chọn lại' : 'Quay lại'}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Director Card with enhanced animations */}
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8 border border-gray-200 animate-scale-in interactive-lift">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-medium text-gray-900 mb-6 animate-fade-in">
                Retail Director
              </h1>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 animate-slide-up animate-stagger-1">
                <h2 className="text-xl font-medium text-gray-900 mb-2 animate-fade-in animate-stagger-2">
                  {selectedDirector.name}
                </h2>
                <p className="text-gray-600 text-sm animate-fade-in animate-stagger-3">
                  {selectedDirector.email}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {selectedDirector.department_type} • {selectedDirector.location}
                </p>
              </div>
            </div>

            {/* Password Form with enhanced animations */}
            <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up animate-stagger-2">
              <div className="relative animate-fade-in animate-stagger-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all-smooth interactive-scale pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-11 text-gray-500 hover:text-gray-700 transition-all-smooth interactive-scale p-1 rounded-md hover:bg-gray-100"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5 transition-transform-smooth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 transition-transform-smooth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={!password || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all-smooth interactive-scale focus-ring animate-fade-in animate-stagger-4"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span>Đang xác thực...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Đăng nhập</span>
                    <svg className="w-5 h-5 ml-2 transition-transform-smooth group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </button>
            </form>


          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6">
        {/* Empty footer for spacing */}
      </footer>
    </div>
  );
}
