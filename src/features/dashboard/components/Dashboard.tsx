import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardStatsCards from '../../../components/DashboardStatsCards';
import DashboardTabs from '../../../components/DashboardTabs';
import LocationTabs from '../../../components/LocationTabs';
import TeamMembersStats from '../../../components/TeamMembersStats';
import TeamSelector from '../../../components/TeamSelector';
import TimeFilterDropdown from '../../../components/TimeFilterDropdown';
import {
  dashboardMockData,
  formatCurrency,
  formatPercentage,
} from '../../../data/dashboardMockData';
import { autoMoveService } from '../../../services/autoMoveService';
import {
  CategoryStats,
  DashboardStats,
  TimeFilter,
  getDashboardStats,
} from '../../../services/dashboardStatsService';
import { useAuth } from '../../auth/hooks/useAuth';
import { PlanningTab } from '../../planning/components/PlanningTab';
import { HRManagement } from './HRManagement';
import { MobileDock } from './MobileDock';
import { SettingsTab } from './SettingsTab';
import TaskList from './TaskList';
import { YouTubeSidebar } from './YouTubeSidebar';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dashboard stats state
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>({ period: 'month' });
  const [activeDashboardTab, setActiveDashboardTab] = useState<
    'personal' | 'team' | 'department' | 'locations'
  >('personal');

  // Location and team selection state
  const [activeLocation, setActiveLocation] = useState<'hanoi' | 'hcm'>('hanoi');
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');
  const [selectedTeamName, setSelectedTeamName] = useState<string>('');

  // Sync URL with active tab và maintain state khi refresh
  useEffect(() => {
    if (tab && ['home', 'work', 'plan', 'customers', 'hr', 'settings'].includes(tab)) {
      setActiveTab(tab);
    } else if (!tab) {
      // Nếu không có tab trong URL, lấy từ localStorage hoặc default to home
      const savedTab = localStorage.getItem('dashboard-active-tab');
      if (savedTab && ['home', 'work', 'plan', 'customers', 'hr', 'settings'].includes(savedTab)) {
        setActiveTab(savedTab);
        navigate(`/dashboard/${savedTab}`, { replace: true });
      } else {
        setActiveTab('home');
        navigate('/dashboard/home', { replace: true });
      }
    }
  }, [tab, navigate]);

  // Start auto-move scheduler when dashboard loads
  useEffect(() => {
    console.log('🤖 Initializing auto-move scheduler...');
    autoMoveService.startAutoMoveScheduler(60); // Check every 60 minutes
  }, []);

  // Load dashboard stats
  useEffect(() => {
    loadDashboardStats();
  }, [timeFilter]);

  const loadDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const stats = await getDashboardStats(timeFilter);
      setDashboardStats(stats);

      // Set default active tab based on available data
      if (stats.hanoi || stats.hcm) {
        setActiveDashboardTab('locations');
      } else if (stats.team) {
        setActiveDashboardTab('team');
      } else {
        setActiveDashboardTab('personal');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle tab change with URL navigation và save state
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/dashboard/${newTab}`, { replace: true });
    // Lưu active tab vào localStorage để maintain state khi refresh
    localStorage.setItem('dashboard-active-tab', newTab);
    // Auto-close sidebar on mobile after selection
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Map sidebar tabs to dashboard content
  const getTabTitle = (tab: string) => {
    const tabTitles: { [key: string]: string } = {
      home: 'Trang Chủ',
      work: 'Công Việc',
      plan: 'Kế Hoạch',
      customers: 'Khách Hàng',
      hr: 'Quản Lý Nhân Viên',
      settings: 'Cài đặt',
    };
    return tabTitles[tab] || 'Trang Chủ';
  };

  // Get available dashboard tabs based on user role
  const getAvailableDashboardTabs = (): Array<'personal' | 'team' | 'department' | 'locations'> => {
    const tabs: Array<'personal' | 'team' | 'department' | 'locations'> = ['personal'];

    if (dashboardStats?.team) {
      tabs.push('team');
    }

    // Khổng Đức Mạnh chỉ có tab "Theo khu vực", không có "Toàn phòng"
    if (dashboardStats?.hanoi || dashboardStats?.hcm) {
      tabs.push('locations');
    }

    return tabs;
  };

  // Get current stats based on active dashboard tab
  const getCurrentStats = (): CategoryStats => {
    if (!dashboardStats) {
      return {
        ktsNew: 0,
        ktsOld: 0,
        partnerNew: 0,
        partnerOld: 0,
        customerNew: 0,
        customerOld: 0,
        sbgNew: 0,
        sbgOld: 0,
        other: 0,
      };
    }

    switch (activeDashboardTab) {
      case 'locations':
        // Return stats based on selected location
        if (activeLocation === 'hanoi') {
          return dashboardStats.hanoi || dashboardStats.personal;
        } else {
          return dashboardStats.hcm || dashboardStats.personal;
        }
      case 'team':
        return dashboardStats.team || dashboardStats.personal;
      case 'personal':
      default:
        return dashboardStats.personal;
    }
  };

  // Get current stats title
  const getCurrentStatsTitle = (): string => {
    switch (activeDashboardTab) {
      case 'locations':
        return `Thống kê ${activeLocation === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}`;
      case 'team':
        return 'Thống kê nhóm';
      case 'personal':
      default:
        return 'Thống kê cá nhân';
    }
  };

  // Handle team selection
  const handleTeamSelect = (teamId: string, teamName: string) => {
    setSelectedTeamId(teamId);
    setSelectedTeamName(teamName);
  };

  // Get team members stats for selected team
  const getSelectedTeamMembers = () => {
    if (!dashboardStats?.teamMembers || !selectedTeamId) {
      return [];
    }
    return dashboardStats.teamMembers;
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* YouTube-style Sidebar */}
      <YouTubeSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={handleLogout}
        isModalOpen={isModalOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top bar */}
        <header className="bg-gray-800 shadow-sm border-b border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-white">{getTabTitle(activeTab)}</h1>
            </div>
            {activeTab === 'home' && (
              <TimeFilterDropdown
                value={timeFilter}
                onChange={setTimeFilter}
                className="hidden md:block"
              />
            )}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-900 p-6 pb-16 md:pb-6">
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Mobile Time Filter */}
              <div className="md:hidden">
                <TimeFilterDropdown
                  value={timeFilter}
                  onChange={setTimeFilter}
                  className="w-full"
                />
              </div>

              {/* Dashboard Tabs */}
              <DashboardTabs
                activeTab={activeDashboardTab}
                onTabChange={setActiveDashboardTab}
                availableTabs={getAvailableDashboardTabs()}
              />

              {/* Dynamic Statistics Section */}
              {activeDashboardTab === 'locations' ? (
                <div className="space-y-6">
                  {/* Location Tabs */}
                  <LocationTabs
                    activeLocation={activeLocation}
                    onLocationChange={setActiveLocation}
                  />

                  {/* Location Stats */}
                  <DashboardStatsCards
                    stats={getCurrentStats()}
                    title={getCurrentStatsTitle()}
                    isLoading={statsLoading}
                  />

                  {/* Team Selector */}
                  <TeamSelector
                    location={activeLocation === 'hanoi' ? 'Hà Nội' : 'Hồ Chí Minh'}
                    selectedTeamId={selectedTeamId}
                    onTeamSelect={handleTeamSelect}
                  />

                  {/* Team Members Stats */}
                  {selectedTeamId && selectedTeamName && (
                    <TeamMembersStats
                      members={getSelectedTeamMembers()}
                      teamName={selectedTeamName}
                      isLoading={statsLoading}
                    />
                  )}
                </div>
              ) : activeDashboardTab === 'team' && dashboardStats?.teamMembers ? (
                <div className="space-y-6">
                  {/* Team Stats */}
                  <DashboardStatsCards
                    stats={getCurrentStats()}
                    title={getCurrentStatsTitle()}
                    isLoading={statsLoading}
                  />

                  {/* Team Members Stats */}
                  <TeamMembersStats
                    members={dashboardStats.teamMembers}
                    teamName={user?.team?.name || 'Nhóm của bạn'}
                    isLoading={statsLoading}
                  />
                </div>
              ) : (
                <DashboardStatsCards
                  stats={getCurrentStats()}
                  title={getCurrentStatsTitle()}
                  isLoading={statsLoading}
                />
              )}

              {/* Legacy Statistics Section - Keep for backward compatibility */}
              <div className="hidden">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Thống kê chi tiết (Legacy)
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* KTS CÁ NHÂN */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        KTS CÁ NHÂN
                      </h3>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-white">
                        {dashboardMockData.categoryStats.architects.total}
                      </span>
                      <span className="text-sm text-gray-400">
                        Trước: {dashboardMockData.categoryStats.architects.existing}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-green-400">↑ 0%</span>
                      <span className="text-xs text-gray-400">vs kế hoạch</span>
                    </div>
                    {/* Mini Chart */}
                    <div className="h-8 flex items-end space-x-1">
                      <div className="w-2 bg-blue-400 h-4 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-5 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-6 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-7 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-8 rounded-sm"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Mới: {dashboardMockData.categoryStats.architects.new}</span>
                      <span>Cũ: {dashboardMockData.categoryStats.architects.existing}</span>
                    </div>
                  </div>

                  {/* ĐỐI TÁC CÁ NHÂN */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        ĐỐI TÁC CÁ NHÂN
                      </h3>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-white">
                        {dashboardMockData.categoryStats.partners.total}
                      </span>
                      <span className="text-sm text-gray-400">
                        Trước: {dashboardMockData.categoryStats.partners.existing}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-green-400">↑ 0%</span>
                      <span className="text-xs text-gray-400">vs kế hoạch</span>
                    </div>
                    {/* Mini Chart */}
                    <div className="h-8 flex items-end space-x-1">
                      <div className="w-2 bg-blue-400 h-3 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-4 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-6 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-7 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-8 rounded-sm"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Mới: {dashboardMockData.categoryStats.partners.new}</span>
                      <span>Cũ: {dashboardMockData.categoryStats.partners.existing}</span>
                    </div>
                  </div>

                  {/* KHÁCH HÀNG CÁ NHÂN */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        KHÁCH HÀNG CÁ NHÂN
                      </h3>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-white">
                        {dashboardMockData.categoryStats.customers.total}
                      </span>
                      <span className="text-sm text-gray-400">
                        Trước: {dashboardMockData.categoryStats.customers.existing}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-green-400">↑ 0%</span>
                      <span className="text-xs text-gray-400">vs kế hoạch</span>
                    </div>
                    {/* Mini Chart */}
                    <div className="h-8 flex items-end space-x-1">
                      <div className="w-2 bg-blue-400 h-5 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-6 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-7 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-8 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-8 rounded-sm"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Mới: {dashboardMockData.categoryStats.customers.new}</span>
                      <span>Cũ: {dashboardMockData.categoryStats.customers.existing}</span>
                    </div>
                  </div>

                  {/* BÁO GIÁ CÁ NHÂN */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        BÁO GIÁ CÁ NHÂN
                      </h3>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-white">
                        {dashboardMockData.categoryStats.quotes.total}
                      </span>
                      <span className="text-sm text-gray-400">
                        Trước: {dashboardMockData.categoryStats.quotes.existing}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-green-400">↑ 0%</span>
                      <span className="text-xs text-gray-400">vs kế hoạch</span>
                    </div>
                    {/* Mini Chart */}
                    <div className="h-8 flex items-end space-x-1">
                      <div className="w-2 bg-blue-400 h-4 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-5 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-6 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-7 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-8 rounded-sm"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Mới: {dashboardMockData.categoryStats.quotes.new}</span>
                      <span>Cũ: {dashboardMockData.categoryStats.quotes.existing}</span>
                    </div>
                  </div>

                  {/* CÔNG VIỆC KHÁC CÁ NHÂN */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        CÔNG VIỆC KHÁC CÁ NHÂN
                      </h3>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-white">
                        {dashboardMockData.categoryStats.otherTasks}
                      </span>
                      <span className="text-sm text-gray-400">Trước: 0</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-green-400">↑ 0%</span>
                      <span className="text-xs text-gray-400">vs kế hoạch</span>
                    </div>
                    {/* Mini Chart */}
                    <div className="h-8 flex items-end space-x-1">
                      <div className="w-2 bg-blue-400 h-3 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-4 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-5 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-6 rounded-sm"></div>
                      <div className="w-2 bg-blue-400 h-8 rounded-sm"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>
                        Mới: {Math.floor(dashboardMockData.categoryStats.otherTasks * 0.3)}
                      </span>
                      <span>
                        Cũ: {Math.floor(dashboardMockData.categoryStats.otherTasks * 0.7)}
                      </span>
                    </div>
                  </div>

                  {/* DOANH SỐ CÁ NHÂN */}
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                        DOANH SỐ CÁ NHÂN
                      </h3>
                      <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    </div>
                    <div className="flex items-baseline space-x-2 mb-2">
                      <span className="text-3xl font-bold text-white">0</span>
                      <span className="text-sm text-orange-400">VNĐ</span>
                      <span className="text-sm text-gray-400">Trước: 0 VNĐ</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs text-green-400">↑ 0%</span>
                      <span className="text-xs text-gray-400">vs kế hoạch</span>
                    </div>
                    {/* Mini Chart */}
                    <div className="h-8 flex items-end space-x-1">
                      <div className="w-2 bg-orange-400 h-2 rounded-sm"></div>
                      <div className="w-2 bg-orange-400 h-3 rounded-sm"></div>
                      <div className="w-2 bg-orange-400 h-4 rounded-sm"></div>
                      <div className="w-2 bg-orange-400 h-5 rounded-sm"></div>
                      <div className="w-2 bg-orange-400 h-6 rounded-sm"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Mới: 0</span>
                      <span>Cũ: 0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dream Machine Style Cards */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Tổng quan hệ thống</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* TỔNG CÔNG VIỆC Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800 p-6 h-64 group hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
                    <div className="relative z-10">
                      <div className="text-xs text-gray-300 uppercase tracking-wider mb-2">
                        TASK MANAGEMENT
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">TỔNG CÔNG VIỆC</h3>
                      <div className="text-3xl font-bold text-white mb-2">
                        {dashboardMockData.managerStats.totalTasks}
                      </div>
                      <div className="text-sm text-gray-300">Công việc</div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>

                  {/* HOÀN THÀNH Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 p-6 h-64 group hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30"></div>
                    <div className="relative z-10">
                      <div className="text-xs text-purple-200 uppercase tracking-wider mb-2">
                        COMPLETED
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">HOÀN THÀNH</h3>
                      <div className="text-3xl font-bold text-white mb-2">
                        {dashboardMockData.managerStats.completedTasks}
                      </div>
                      <div className="text-sm text-purple-200">Công việc</div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-pink-400 rounded-full"></div>
                  </div>

                  {/* TỶ LỆ HOÀN THÀNH Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 p-6 h-64 group hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20"></div>
                    <div className="relative z-10">
                      <div className="text-xs text-emerald-200 uppercase tracking-wider mb-2">
                        COMPLETION RATE
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">TỶ LỆ HOÀN THÀNH</h3>
                      <div className="text-3xl font-bold text-white mb-2">
                        {formatPercentage(dashboardMockData.managerStats.completionRate)}
                      </div>
                      <div className="text-sm text-emerald-200">Hiệu suất</div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-emerald-400 rounded-full"></div>
                  </div>

                  {/* DOANH SỐ HÀ NỘI Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-orange-700 to-red-700 p-6 h-64 group hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/20"></div>
                    <div className="relative z-10">
                      <div className="text-xs text-amber-200 uppercase tracking-wider mb-2">
                        HANOI REVENUE
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">DOANH SỐ HÀ NỘI</h3>
                      <div className="text-2xl font-bold text-white mb-2">
                        {formatCurrency(dashboardMockData.managerStats.hanoiRevenue)}
                      </div>
                      <div className="text-sm text-amber-200">Doanh thu</div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏢</span>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-amber-400 rounded-full"></div>
                  </div>

                  {/* DOANH SỐ HCM Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-pink-700 to-purple-700 p-6 h-64 group hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-purple-500/20"></div>
                    <div className="relative z-10">
                      <div className="text-xs text-rose-200 uppercase tracking-wider mb-2">
                        HCM REVENUE
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">DOANH SỐ HCM</h3>
                      <div className="text-2xl font-bold text-white mb-2">
                        {formatCurrency(dashboardMockData.managerStats.hcmRevenue)}
                      </div>
                      <div className="text-sm text-rose-200">Doanh thu</div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">🏬</span>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-rose-400 rounded-full"></div>
                  </div>

                  {/* TEAM PERFORMANCE CARD */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-700 p-6 h-64 group hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-indigo-500/20"></div>
                    <div className="relative z-10">
                      <div className="text-xs text-violet-200 uppercase tracking-wider mb-2">
                        TEAM
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">PERFORMANCE</h3>
                      <div className="text-sm text-violet-200 mb-4">
                        {dashboardMockData.teamStats.totalMembers} Members
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div className="absolute top-4 right-4 w-2 h-2 bg-violet-400 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs content */}
          {activeTab === 'work' && (
            <div className="space-y-8">
              <TaskList
                userRole={user?.role === 'retail_director' ? 'manager' : 'employee'}
                currentUser={user?.name || 'Unknown User'}
                onModalStateChange={setIsModalOpen}
              />
            </div>
          )}

          {activeTab === 'plan' && <PlanningTab />}

          {activeTab === 'customers' && (
            <div className="space-y-8">
              <div className="bg-gray-800 rounded-lg shadow-sm p-8 text-center border border-gray-700">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Quản lý Khách Hàng</h3>
                <p className="text-gray-400">Tính năng quản lý khách hàng đang được phát triển.</p>
              </div>
            </div>
          )}

          {activeTab === 'hr' && (
            <div className="space-y-8">
              <HRManagement />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <SettingsTab onLogout={handleLogout} />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Dock Navigation */}
      <MobileDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isModalOpen={isModalOpen}
        onLogout={handleLogout}
      />
    </div>
  );
}
