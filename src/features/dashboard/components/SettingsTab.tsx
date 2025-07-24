import { useState } from 'react';
import { SettingsCard } from './SettingsCard';
import { HRManagement } from './HRManagement';

interface SettingsTabProps {
  onLogout: () => void;
}

export function SettingsTab({ onLogout }: SettingsTabProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState('account');
  const handleAccountInfo = () => {
    console.log('Chỉnh sửa thông tin tài khoản');
  };

  const handleChangeEmail = () => {
    console.log('Đổi email');
  };

  const handleChangePassword = () => {
    console.log('Đổi mật khẩu');
  };

  const handleChangeAvatar = () => {
    console.log('Đổi avatar');
  };

  const handleChangeCover = () => {
    console.log('Đổi ảnh bìa');
  };

  const renderTabContent = () => {
    switch (activeSettingsTab) {
      case 'account':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Account Information */}
            <SettingsCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              title="Thông tin tài khoản"
              description="Quản lý thông tin cá nhân và tài khoản của bạn"
              buttonText="Chỉnh sửa thông tin"
              buttonColor="blue"
              onClick={handleAccountInfo}
            />

            {/* Change Email */}
            <SettingsCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
              title="Đổi Email"
              description="Cập nhật địa chỉ email của tài khoản"
              buttonText="Thay đổi email"
              buttonColor="green"
              onClick={handleChangeEmail}
            />

            {/* Change Password */}
            <SettingsCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Đổi mật khẩu"
              description="Cập nhật mật khẩu để bảo mật tài khoản"
              buttonText="Đổi mật khẩu"
              buttonColor="yellow"
              onClick={handleChangePassword}
            />

            {/* Change Avatar */}
            <SettingsCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Đổi Avatar"
              description="Thay đổi ảnh đại diện của bạn"
              buttonText="Tải ảnh lên"
              buttonColor="purple"
              onClick={handleChangeAvatar}
            />

            {/* Change Cover Photo */}
            <SettingsCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" />
                </svg>
              }
              title="Đổi ảnh bìa"
              description="Cập nhật ảnh bìa cho hồ sơ của bạn"
              buttonText="Thay đổi ảnh bìa"
              buttonColor="indigo"
              onClick={handleChangeCover}
            />

            {/* Logout */}
            <SettingsCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
              title="Đăng xuất"
              description="Thoát khỏi tài khoản hiện tại"
              buttonText="Đăng xuất"
              buttonColor="red"
              fullWidth={true}
            >
              <button
                onClick={onLogout}
                className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium ml-4"
              >
                Đăng xuất
              </button>
            </SettingsCard>
          </div>
        );

      case 'hr':
        return <HRManagement />;

      default:
        return null;
    }
  };

  return (
    <div className="py-6 md:py-8">
      <div className="max-w-6xl mx-auto px-4 md:px-0">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8">
          Cài đặt
        </h3>

        {/* Horizontal Tabs */}
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveSettingsTab('account')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeSettingsTab === 'account'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Tài khoản</span>
          </button>

          <button
            onClick={() => setActiveSettingsTab('hr')}
            className={`px-6 py-3 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeSettingsTab === 'hr'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Nhân sự</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
