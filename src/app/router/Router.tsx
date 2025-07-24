import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard } from './guards/AuthGuard';

// Auth pages
import { PasswordPage } from '../../features/auth/components/pages/PasswordPage';
import { UserSelectionPage } from '../../features/auth/components/pages/UserSelectionPage';
import { RegionSelectionPage } from '../../features/auth/components/pages/RegionSelectionPage';
import { DirectorLoginPage } from '../../features/auth/components/pages/DirectorLoginPage';
import { TeamSelectionPage } from '../../features/auth/components/pages/TeamSelectionPage';
import { ChangePasswordPage } from '../../features/auth/components/pages/ChangePasswordPage';

// Dashboard
import { Dashboard } from '../../features/dashboard/components';

// Test pages
import TestDropdown from '../../pages/TestDropdown';

export function Router() {
  return (
    <Routes>
      {/* Public routes (no auth required) */}
      <Route
        path="/auth/region-selection"
        element={
          <AuthGuard requireAuth={false}>
            <RegionSelectionPage />
          </AuthGuard>
        }
      />

      <Route
        path="/auth/director-login"
        element={
          <AuthGuard requireAuth={false}>
            <DirectorLoginPage />
          </AuthGuard>
        }
      />

      <Route
        path="/auth/team-selection"
        element={
          <AuthGuard requireAuth={false}>
            <TeamSelectionPage />
          </AuthGuard>
        }
      />

      <Route
        path="/auth/user-selection"
        element={
          <AuthGuard requireAuth={false}>
            <UserSelectionPage />
          </AuthGuard>
        }
      />



      <Route
        path="/auth/password"
        element={
          <AuthGuard requireAuth={false}>
            <PasswordPage />
          </AuthGuard>
        }
      />

      <Route
        path="/auth/change-password"
        element={
          <AuthGuard requireAuth={false}>
            <ChangePasswordPage />
          </AuthGuard>
        }
      />

      {/* Protected routes (auth required) */}
      <Route
        path="/dashboard"
        element={
          <AuthGuard requireAuth={true}>
            <Dashboard />
          </AuthGuard>
        }
      />
      <Route
        path="/dashboard/:tab"
        element={
          <AuthGuard requireAuth={true}>
            <Dashboard />
          </AuthGuard>
        }
      />

      {/* Test routes (development only) */}
      <Route
        path="/test/dropdown"
        element={
          <AuthGuard requireAuth={false}>
            <TestDropdown />
          </AuthGuard>
        }
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/auth/region-selection" replace />} />
      <Route path="/auth" element={<Navigate to="/auth/region-selection" replace />} />
      <Route path="/auth/login" element={<Navigate to="/auth/region-selection" replace />} />
      
      {/* 404 fallback */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-gray-600 mb-6">Trang không tìm thấy</p>
              <a
                href="/auth/region-selection"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Về trang chọn khu vực
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
}
