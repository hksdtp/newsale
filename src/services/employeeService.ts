import { supabase } from '../shared/api/supabase';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'team_leader' | 'retail_director';
  team_id: string;
  location: string;
  department_type: string;
  team?: {
    id: string;
    name: string;
  } | {
    id: string;
    name: string;
  }[];
}

export interface TaggedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  location: string;
  team_name?: string;
}

class EmployeeService {
  // Get all employees from HR system
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          team_id,
          location,
          department_type,
          team:teams(id, name)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching employees:', error);
        return [];
      }

      return users || [];
    } catch (error) {
      console.error('Error in getAllEmployees:', error);
      return [];
    }
  }

  // Get employees that can be assigned tasks by current user
  async getAssignableEmployees(currentUserId: string, currentUserRole: string, currentUserLocation: string): Promise<Employee[]> {
    try {
      const allEmployees = await this.getAllEmployees();
      
      // Filter based on role permissions
      if (currentUserRole === 'retail_director') {
        // Director can assign to anyone except themselves
        return allEmployees.filter(emp => emp.id !== currentUserId);
      } else if (currentUserRole === 'team_leader') {
        // Team leader can only assign to employees in their location
        return allEmployees.filter(emp => 
          emp.role === 'employee' && 
          emp.location === currentUserLocation &&
          emp.id !== currentUserId
        );
      }
      
      // Employees cannot assign tasks
      return [];
    } catch (error) {
      console.error('Error in getAssignableEmployees:', error);
      return [];
    }
  }

  // Get employees for tagging (filtered by location, team permissions, and exclude current user)
  async getTaggableEmployees(currentUserId: string, currentUserLocation?: string): Promise<TaggedUser[]> {
    try {
      const allEmployees = await this.getAllEmployees();

      // Get current user info for team-based filtering
      const currentUser = await this.getEmployeeById(currentUserId);
      if (!currentUser) {
        console.warn('Current user not found for tagging permissions');
        return [];
      }

      return allEmployees
        .filter(emp => {
          // Exclude current user
          if (emp.id === currentUserId) return false;

          // Filter by location if provided
          if (currentUserLocation && emp.location !== currentUserLocation) return false;

          // 🔒 SECURITY: Team-based assignment permissions
          const canAssignToThisUser = this.canAssignTaskToUser(currentUser, emp);
          if (!canAssignToThisUser) {
            console.log(`🔒 Assignment blocked: ${currentUser.name} (${currentUser.role}) cannot assign to ${emp.name} (${emp.role}) - different teams`);
            return false;
          }

          return true;
        })
        .map(emp => ({
          id: emp.id,
          name: emp.name,
          email: emp.email,
          role: this.getRoleDisplay(emp.role),
          location: emp.location,
          team_name: Array.isArray(emp.team) ? emp.team[0]?.name : emp.team?.name || 'Không có nhóm'
        }));
    } catch (error) {
      console.error('Error in getTaggableEmployees:', error);
      return [];
    }
  }

  // 🔒 SECURITY: Check if current user can assign tasks to target user
  private canAssignTaskToUser(currentUser: Employee, targetUser: Employee): boolean {
    // Directors can assign to anyone
    if (currentUser.role === 'retail_director') {
      return true;
    }

    // Team leaders can assign to:
    // 1. Their own team members
    // 2. Themselves
    if (currentUser.role === 'team_leader') {
      return (
        currentUser.team_id === targetUser.team_id || // Same team
        currentUser.id === targetUser.id // Self-assignment
      );
    }

    // Regular employees can only assign to:
    // 1. Their own team members (collaboration)
    // 2. Themselves
    if (currentUser.role === 'employee') {
      return (
        currentUser.team_id === targetUser.team_id || // Same team only
        currentUser.id === targetUser.id // Self-assignment
      );
    }

    // Default: deny
    return false;
  }

  // Get employees by location
  async getEmployeesByLocation(location: string): Promise<Employee[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          team_id,
          location,
          department_type,
          team:teams(id, name)
        `)
        .eq('location', location)
        .order('name');

      if (error) {
        console.error('Error fetching employees by location:', error);
        return [];
      }

      return users || [];
    } catch (error) {
      console.error('Error in getEmployeesByLocation:', error);
      return [];
    }
  }

  // Get employees by team
  async getEmployeesByTeam(teamId: string): Promise<Employee[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          team_id,
          location,
          department_type,
          team:teams(id, name)
        `)
        .eq('team_id', teamId)
        .order('name');

      if (error) {
        console.error('Error fetching employees by team:', error);
        return [];
      }

      return users || [];
    } catch (error) {
      console.error('Error in getEmployeesByTeam:', error);
      return [];
    }
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<Employee | null> {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          team_id,
          location,
          department_type,
          team:teams(id, name)
        `)
        .eq('id', id)
        .single();

      if (error || !user) {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error in getEmployeeById:', error);
      return null;
    }
  }

  // Helper method to get role display name
  private getRoleDisplay(role: string): string {
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
  }

  // Search employees by name or email (filtered by location)
  async searchEmployees(query: string, currentUserId: string, currentUserLocation?: string): Promise<TaggedUser[]> {
    try {
      const allEmployees = await this.getTaggableEmployees(currentUserId, currentUserLocation);

      if (!query.trim()) {
        return allEmployees.slice(0, 8); // Return first 8 if no query
      }

      const searchTerm = query.toLowerCase();
      return allEmployees
        .filter(emp =>
          emp.name.toLowerCase().includes(searchTerm) ||
          emp.email.toLowerCase().includes(searchTerm)
        )
        .slice(0, 8); // Limit to 8 results
    } catch (error) {
      console.error('Error in searchEmployees:', error);
      return [];
    }
  }

  // Get current user from localStorage and fetch full data
  async getCurrentEmployee(): Promise<Employee | null> {
    try {
      const savedUser = localStorage.getItem('auth_user');
      if (!savedUser) {
        return null;
      }

      const authUser = JSON.parse(savedUser);
      return await this.getEmployeeById(authUser.id);
    } catch (error) {
      console.error('Error in getCurrentEmployee:', error);
      return null;
    }
  }
}

export const employeeService = new EmployeeService();
