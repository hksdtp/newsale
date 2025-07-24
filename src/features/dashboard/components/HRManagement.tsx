import React, { useState, useEffect } from 'react';
import { SettingsCard } from './SettingsCard';
import { supabase } from '../../../shared/api/supabase';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: string;
  joinDate: string;
  team_name?: string;
}

export function HRManagement() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    fetchEmployeesAndTeams();
  }, []);

  const fetchEmployeesAndTeams = async () => {
    try {
      setLoading(true);

      // Fetch users and teams
      const [usersResponse, teamsResponse] = await Promise.all([
        supabase.from('users').select('*').order('name'),
        supabase.from('teams').select('*').order('id')
      ]);

      if (usersResponse.error) throw usersResponse.error;
      if (teamsResponse.error) throw teamsResponse.error;

      const users = usersResponse.data || [];
      const teamsData = teamsResponse.data || [];
      setTeams(teamsData);

      // Create teams map for lookup
      const teamsMap = new Map();
      teamsData.forEach(team => {
        teamsMap.set(team.id.toString(), team.name);
      });

      // Transform users to employees format
      const employeesData: Employee[] = users.map(user => {
        const getRoleDisplay = (role: string) => {
          switch (role) {
            case 'retail_director': return 'Trưởng phòng';
            case 'team_leader': return 'Trưởng nhóm';
            case 'employee': return 'Nhân viên';
            default: return role;
          }
        };

        const getTeamName = (teamId: string) => {
          if (teamId === '0') return 'PHÒNG KINH DOANH';
          return teamsMap.get(teamId) || `Nhóm ${teamId}`;
        };

        const getDepartment = (location: string, teamId: string) => {
          if (teamId === '0') return 'Toàn quốc';
          return `${getTeamName(teamId)} - ${location}`;
        };

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: getRoleDisplay(user.role),
          department: getDepartment(user.location, user.team_id),
          status: 'Đang làm việc', // Default status
          joinDate: new Date(user.created_at).toLocaleDateString('vi-VN'),
          team_name: getTeamName(user.team_id)
        };
      });

      setEmployees(employeesData);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    console.log('Thêm nhân viên mới');
  };

  const handleManageRoles = () => {
    console.log('Quản lý vai trò');
  };

  const handleManageDepartments = () => {
    console.log('Quản lý phòng ban');
  };

  const handleViewReports = () => {
    console.log('Xem báo cáo nhân sự');
  };

  const handleManageLeave = () => {
    console.log('Quản lý nghỉ phép');
  };

  const handlePayroll = () => {
    console.log('Quản lý lương');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang làm việc': return 'bg-green-500/20 text-green-400';
      case 'Nghỉ phép': return 'bg-yellow-500/20 text-yellow-400';
      case 'Nghỉ việc': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Đang tải dữ liệu nhân sự...</span>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: employees.length,
    directors: employees.filter(emp => emp.role === 'Trưởng phòng').length,
    teamLeaders: employees.filter(emp => emp.role === 'Trưởng nhóm').length,
    employees: employees.filter(emp => emp.role === 'Nhân viên').length,
    hanoi: employees.filter(emp => emp.department.includes('Hà Nội')).length,
    hcm: employees.filter(emp => emp.department.includes('Hồ Chí Minh')).length
  };

  return (
    <div className="space-y-8">
      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-sm text-gray-400">Tổng nhân viên</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-blue-400">{stats.directors}</div>
          <div className="text-sm text-gray-400">Trưởng phòng</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-green-400">{stats.teamLeaders}</div>
          <div className="text-sm text-gray-400">Trưởng nhóm</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-purple-400">{stats.employees}</div>
          <div className="text-sm text-gray-400">Nhân viên</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-orange-400">{stats.hanoi}</div>
          <div className="text-sm text-gray-400">Hà Nội</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-2xl font-bold text-cyan-400">{stats.hcm}</div>
          <div className="text-sm text-gray-400">Hồ Chí Minh</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <SettingsCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          }
          title="Thêm nhân viên"
          description="Thêm nhân viên mới vào hệ thống"
          buttonText="Thêm mới"
          buttonColor="blue"
          onClick={handleAddEmployee}
        />

        <SettingsCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          }
          title="Quản lý vai trò"
          description="Phân quyền và quản lý vai trò nhân viên"
          buttonText="Quản lý"
          buttonColor="green"
          onClick={handleManageRoles}
        />

        <SettingsCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          title="Quản lý phòng ban"
          description="Tổ chức và quản lý các phòng ban"
          buttonText="Quản lý"
          buttonColor="purple"
          onClick={handleManageDepartments}
        />

        <SettingsCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          title="Báo cáo nhân sự"
          description="Xem báo cáo và thống kê nhân sự"
          buttonText="Xem báo cáo"
          buttonColor="indigo"
          onClick={handleViewReports}
        />

        <SettingsCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          title="Quản lý nghỉ phép"
          description="Duyệt và quản lý đơn nghỉ phép"
          buttonText="Quản lý"
          buttonColor="yellow"
          onClick={handleManageLeave}
        />

        <SettingsCard
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
          title="Quản lý lương"
          description="Tính lương và quản lý bảng lương"
          buttonText="Quản lý"
          buttonColor="green"
          onClick={handlePayroll}
        />

      </div>

      {/* Employee List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Danh sách nhân viên</h3>
              <p className="text-sm text-gray-400 mt-1">Tổng cộng: {employees.length} nhân viên</p>
            </div>
            <button 
              onClick={handleAddEmployee}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Thêm nhân viên</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phòng ban</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ngày vào</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {employee.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{employee.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{employee.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{employee.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee.status)}`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{employee.joinDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-400 hover:text-blue-300 mr-3">Sửa</button>
                    <button className="text-red-400 hover:text-red-300">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
