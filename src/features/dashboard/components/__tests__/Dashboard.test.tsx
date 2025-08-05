import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from '../Dashboard';
import { AuthProvider } from '../../../../app/providers/AuthProvider';

// Mock useAuth hook
const mockLogout = jest.fn();
jest.mock('../../../auth/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com' },
    logout: mockLogout,
    isAuthenticated: true
  })
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard with user information', () => {
    renderDashboard();

    expect(screen.getByText('Test User')).toBeInTheDocument();
  });



  it('displays tabs with correct labels', () => {
    renderDashboard();

    expect(screen.getByText('Bảng điều khiển')).toBeInTheDocument();
    expect(screen.getByText('Công việc')).toBeInTheDocument();
    expect(screen.getByText('Kế hoạch')).toBeInTheDocument();
    expect(screen.getByText('Cài đặt')).toBeInTheDocument();
  });

  it('displays dashboard content by default', () => {
    renderDashboard();

    expect(screen.getByText("Chào mừng đến Bảng điều khiển")).toBeInTheDocument();
  });





  it('displays settings tab with logout functionality', () => {
    renderDashboard();

    // Switch to settings tab
    const settingsTab = screen.getAllByText('Cài đặt')[0];
    fireEvent.click(settingsTab);

    // Check if settings content is displayed
    expect(screen.getByText('Cài đặt tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Thông tin tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Đổi Email')).toBeInTheDocument();
    expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument();
    expect(screen.getByText('Đổi Avatar')).toBeInTheDocument();
    expect(screen.getByText('Đổi ảnh bìa')).toBeInTheDocument();

    // Test logout functionality
    const logoutButton = screen.getByText('Đăng xuất');
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('handles tab switching', () => {
    renderDashboard();

    const workTab = screen.getAllByText('Công việc')[0]; // Get first occurrence (desktop)
    fireEvent.click(workTab);

    // Check if tab is active (has different styling)
    expect(workTab.closest('button')).toHaveClass('border-blue-600', 'text-blue-600');
  });

  it('displays notification banner', () => {
    renderDashboard();

    expect(screen.getByText('Bán trên Cộng đồng')).toBeInTheDocument();
    expect(screen.getByText(/Bạn có thể đủ điều kiện để bán plugin/)).toBeInTheDocument();
    expect(screen.getByText('Tìm hiểu thêm')).toBeInTheDocument();
  });

  it('displays large SPUR text in hero section', () => {
    renderDashboard();
    
    expect(screen.getByText('SPUR')).toBeInTheDocument();
  });
});
