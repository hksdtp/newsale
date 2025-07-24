import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsTab } from '../SettingsTab';

describe('SettingsTab', () => {
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders settings tab with all options', () => {
    render(<SettingsTab onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Cài đặt tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Thông tin tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Đổi Email')).toBeInTheDocument();
    expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument();
    expect(screen.getByText('Đổi Avatar')).toBeInTheDocument();
    expect(screen.getByText('Đổi ảnh bìa')).toBeInTheDocument();
    expect(screen.getByText('Đăng xuất')).toBeInTheDocument();
  });

  it('displays correct descriptions for each setting', () => {
    render(<SettingsTab onLogout={mockOnLogout} />);
    
    expect(screen.getByText('Quản lý thông tin cá nhân và tài khoản của bạn')).toBeInTheDocument();
    expect(screen.getByText('Cập nhật địa chỉ email của tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Cập nhật mật khẩu để bảo mật tài khoản')).toBeInTheDocument();
    expect(screen.getByText('Thay đổi ảnh đại diện của bạn')).toBeInTheDocument();
    expect(screen.getByText('Cập nhật ảnh bìa cho hồ sơ của bạn')).toBeInTheDocument();
    expect(screen.getByText('Thoát khỏi tài khoản hiện tại')).toBeInTheDocument();
  });

  it('calls onLogout when logout button is clicked', () => {
    render(<SettingsTab onLogout={mockOnLogout} />);
    
    const logoutButton = screen.getByText('Đăng xuất');
    fireEvent.click(logoutButton);
    
    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('logs console messages when setting buttons are clicked', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<SettingsTab onLogout={mockOnLogout} />);
    
    // Test account info button
    const accountButton = screen.getByText('Chỉnh sửa thông tin');
    fireEvent.click(accountButton);
    expect(consoleSpy).toHaveBeenCalledWith('Chỉnh sửa thông tin tài khoản');
    
    // Test change email button
    const emailButton = screen.getByText('Thay đổi email');
    fireEvent.click(emailButton);
    expect(consoleSpy).toHaveBeenCalledWith('Đổi email');
    
    // Test change password button
    const passwordButton = screen.getByText('Đổi mật khẩu');
    fireEvent.click(passwordButton);
    expect(consoleSpy).toHaveBeenCalledWith('Đổi mật khẩu');
    
    // Test change avatar button
    const avatarButton = screen.getByText('Tải ảnh lên');
    fireEvent.click(avatarButton);
    expect(consoleSpy).toHaveBeenCalledWith('Đổi avatar');
    
    // Test change cover button
    const coverButton = screen.getByText('Thay đổi ảnh bìa');
    fireEvent.click(coverButton);
    expect(consoleSpy).toHaveBeenCalledWith('Đổi ảnh bìa');
    
    consoleSpy.mockRestore();
  });

  it('has responsive grid layout', () => {
    render(<SettingsTab onLogout={mockOnLogout} />);
    
    const gridContainer = screen.getByText('Cài đặt tài khoản').nextElementSibling;
    expect(gridContainer).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2');
  });

  it('displays icons for each setting option', () => {
    render(<SettingsTab onLogout={mockOnLogout} />);
    
    // Check that SVG icons are present (by checking for svg elements)
    const svgElements = screen.getAllByRole('img', { hidden: true });
    expect(svgElements.length).toBeGreaterThan(0);
  });
});
