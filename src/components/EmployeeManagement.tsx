import React, { useEffect, useState } from 'react';
import { supabase } from '../shared/api/supabase';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'team_leader' | 'retail_director';
  team_id: string | null;
  location: string;
  department_type: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  location: string;
  description?: string;
}

interface EmployeeManagementProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ currentUser }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  // const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee' as const,
    team_id: '',
    location: 'Hà Nội',
    department_type: 'Kinh doanh',
    password: '123456',
  });

  const [teamFormData, setTeamFormData] = useState({
    name: '',
    location: 'HN',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeesResponse, teamsResponse] = await Promise.all([
        supabase.from('users').select('*').order('name'),
        supabase.from('teams').select('*').order('name'),
      ]);

      if (employeesResponse.error) throw employeesResponse.error;
      if (teamsResponse.error) throw teamsResponse.error;

      setEmployees(employeesResponse.data || []);
      setTeams(teamsResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('users').insert([
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_changed: false,
          role: formData.role,
          team_id: formData.team_id || null,
          location: formData.location,
          department_type: formData.department_type,
        },
      ]);

      if (error) throw error;

      setShowAddForm(false);
      setFormData({
        name: '',
        email: '',
        role: 'employee',
        team_id: '',
        location: 'Hà Nội',
        department_type: 'Kinh doanh',
        password: '123456',
      });
      loadData();
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Lỗi thêm nhân viên: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Chỉ insert name và description, không có location
      const { error } = await supabase.from('teams').insert([
        {
          name: teamFormData.name,
          description: teamFormData.description,
        },
      ]);

      if (error) throw error;

      setShowAddTeamForm(false);
      setTeamFormData({
        name: '',
        location: 'HN',
        description: '',
      });
      loadData();
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Lỗi thêm nhóm: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) return;

    try {
      const { error } = await supabase.from('users').delete().eq('id', employeeId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Lỗi xóa nhân viên: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm này? Các thành viên sẽ không còn nhóm.')) return;

    try {
      // First, remove team_id from users
      await supabase.from('users').update({ team_id: null }).eq('team_id', teamId);

      // Then delete the team
      const { error } = await supabase.from('teams').delete().eq('id', teamId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Lỗi xóa nhóm: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return 'Chưa có nhóm';
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Không xác định';
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'retail_director':
        return 'Giám đốc';
      case 'team_leader':
        return 'Trưởng nhóm';
      case 'employee':
        return 'Nhân viên';
      default:
        return role;
    }
  };

  // Only allow retail_director to manage employees
  if (currentUser?.role !== 'retail_director') {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center text-gray-400">
          <p>Bạn không có quyền quản lý nhân viên.</p>
          <p className="text-sm mt-2">Chỉ Giám đốc mới có thể thêm/xóa nhân viên và nhóm.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Quản lý Nhân viên & Nhóm</h2>
            <p className="text-gray-400 mt-1">Thêm, sửa, xóa nhân viên và nhóm trong hệ thống</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowAddTeamForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              + Thêm Nhóm
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + Thêm Nhân viên
            </button>
          </div>
        </div>
      </div>

      {/* Add Employee Form */}
      {showAddForm && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Thêm Nhân viên Mới</h3>
          <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tên</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Vai trò</label>
              <select
                value={formData.role}
                onChange={e =>
                  setFormData({
                    ...formData,
                    role: e.target.value as 'employee' | 'team_leader' | 'retail_director',
                  })
                }
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="employee">Nhân viên</option>
                <option value="team_leader">Trưởng nhóm</option>
                <option value="retail_director">Giám đốc</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nhóm</label>
              <select
                value={formData.team_id}
                onChange={e => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="">Chưa có nhóm</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Khu vực</label>
              <select
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Phòng ban</label>
              <input
                type="text"
                value={formData.department_type}
                onChange={e => setFormData({ ...formData, department_type: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thêm Nhân viên
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Team Form */}
      {showAddTeamForm && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Thêm Nhóm Mới</h3>
          <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tên nhóm</label>
              <input
                type="text"
                value={teamFormData.name}
                onChange={e => setTeamFormData({ ...teamFormData, name: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="VD: NHÓM 5 - Mai Tiến Đạt"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Khu vực</label>
              <div className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400">
                Hà Nội (mặc định)
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Mô tả</label>
              <input
                type="text"
                value={teamFormData.description}
                onChange={e => setTeamFormData({ ...teamFormData, description: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="VD: Nhóm kinh doanh Hà Nội 5"
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Thêm Nhóm
              </button>
              <button
                type="button"
                onClick={() => setShowAddTeamForm(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Danh sách Nhóm ({teams.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tên nhóm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Khu vực
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Thành viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {teams.map(team => {
                const teamMembers = employees.filter(emp => emp.team_id === team.id);
                return (
                  <tr key={team.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Hà Nội</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {team.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {teamMembers.length} người
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employees List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="bg-gray-900 px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">
            Danh sách Nhân viên ({employees.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Nhóm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Khu vực
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {employee.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getRoleDisplay(employee.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {getTeamName(employee.team_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {employee.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      disabled={employee.id === currentUser?.id}
                    >
                      {employee.id === currentUser?.id ? 'Bản thân' : 'Xóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
